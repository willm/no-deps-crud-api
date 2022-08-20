import {rm, writeFile, mkdir, access, readdir, readFile} from 'node:fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';

export const Storage = () => {
  const POSTS_DIR = join(tmpdir(), 'crud-api');
  console.log(POSTS_DIR);

  return {
    async reset() {
      try {
        await access(POSTS_DIR);
        await rm(POSTS_DIR, {recursive: true, force: true});
      } finally {
        await mkdir(POSTS_DIR);
      }
    },
    async add(post) {
      await writeFile(
        join(POSTS_DIR, `${post.date}.json`),
        JSON.stringify(post)
      );
    },
    async list() {
      return (await readdir(POSTS_DIR))
        .map(fileName => fileName.replace('.json', ''));
    },
    async get(date) {
      return await readFile(join(POSTS_DIR, `${date}.json`), {encoding: 'utf8'});
    },
    async delete(id) {
      await rm(join(POSTS_DIR, `${id}.json`));
    }
  };
};
