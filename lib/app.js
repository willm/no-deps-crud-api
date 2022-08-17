import {rmSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';

const Storage = () => {
  const POSTS_DIR = join(tmpdir(), 'crud-api');
  console.log(POSTS_DIR);
  if (existsSync(POSTS_DIR)) {
    rmSync(POSTS_DIR, {recursive: true, force: true});
  }
  mkdirSync(POSTS_DIR);
  return {
    add(post) {
      writeFileSync(
        join(POSTS_DIR, post.date),
        JSON.stringify(post)
      );
    },
    get() {
      return readdirSync(POSTS_DIR);
    }
  };
};

const getPosts = (_req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    posts: []
  }));
};

const addPost = (req, res) => {
  let body = '';
  req.on('data', data => body += data.toString('utf8'));
  req.on('end', () => {
    console.log(body);
    const post = JSON.parse(body);
    const storage = Storage();
    storage.add(post);
    res.writeHead(201, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({posts: storage.get()}));
  });
};

export const App = () => {
  const routes = [
    ['GET', '/posts', getPosts],
    ['POST', '/posts', addPost],
  ];
  return (req, res) => {
    const match = routes.find(route => {
    const [method, url] = route;
      return req.url === url && req.method === method;
    });
    if (match) {
      const handler = match[2]
      return handler(req, res);
    }
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("Not Found");
  };
};
