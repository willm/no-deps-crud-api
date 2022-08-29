import {
  rm,
  writeFile,
  mkdir,
  access,
  readdir,
  readFile,
} from 'node:fs/promises';
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
      } catch (err) {
        console.warn(`${POSTS_DIR} does not exist, creating`);
      } finally {
        await mkdir(POSTS_DIR);
      }
    },
    async add(id, post) {
      const {title} = post;
      await Promise.all([
        writeFile(
          join(POSTS_DIR, `${id}.meta.json`),
          JSON.stringify({title, id})
        ),
        writeFile(join(POSTS_DIR, `${id}.json`), JSON.stringify(post)),
      ]);
    },
    async list() {
      const files = await Promise.all((await readdir(POSTS_DIR))
        .filter((fileName) => fileName.endsWith('.meta.json'))
        .map((fileName) => readFile(join(POSTS_DIR, fileName), {encoding: 'utf8'})));

      return files.map(file => JSON.parse(file));
    },
    async get(id) {
      return await readFile(join(POSTS_DIR, `${id}.json`), {
        encoding: 'utf8',
      });
    },
    async delete(id) {
      await Promise.all([
        rm(join(POSTS_DIR, `${id}.json`)),
        rm(join(POSTS_DIR, `${id}.meta.json`)),
      ]);
    },
  };
};
