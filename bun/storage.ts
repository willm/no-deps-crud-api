import {unlinkSync} from 'fs';
import {join} from 'path';
import {tmpdir} from 'os';
import {Database} from 'bun:sqlite';

interface Post {
  date: Date;
  title: string;
  body: string;
  id: number;
}

interface Storage {
  reset: () => void;
  list: () => Post[]
  add: (post: Post) => void;
}

export const Storage = (): Storage => {
  const path = join(tmpdir(), 'bun-crud-api.sqlite');
  const createTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY,
      date INTEGER,
      title TEXT,
      body TEXT
    )`;

  const db = new Database(path);
  db.run(createTable);
  return {
    reset() {
      unlinkSync(path);
      new Database(path).run(createTable);
    },
    list: () => {
      return new Database(path).query(`
        SELECT id FROM posts`
      ).all().map(post => post.id);
    },
    add: (post: Post) => {
      new Database(path).run(`
        INSERT INTO posts (date, title, body, id)
        VALUES (?, ?, ?, ?);
        `,
        Math.round(post.date.getTime() / 1000), post.title, post.body, post.id
      );
    }
  };
}
