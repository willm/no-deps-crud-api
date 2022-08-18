import {rm, writeFile, mkdir, access, readdir} from 'node:fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';

export const Storage = () => {
  const POSTS_DIR = join(tmpdir(), 'crud-api');

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
    async get() {
      return (await readdir(POSTS_DIR))
        .map(fileName => fileName.replace('.json', ''));
    },
    async delete(id) {
      await rm(join(POSTS_DIR, `${id}.json`));
    }
  };
};

const getPosts = (ctx) => {
  const {res} = ctx;
  sendJSONResponse(res, {status: 200,  body: { posts: [] }});
};

const sendJSONResponse = (res, options) => {
  res.writeHead(options.status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(options.body));
};

const addPost = (ctx) => {
  const {req, res, storage} = ctx;
  let body = '';
  req.on('data', data => body += data.toString('utf8'));
  req.on('end', async () => {
    const post = JSON.parse(body);
    storage.add(post);
    sendJSONResponse(res, {status: 201, body: {posts: await storage.get()}});
  });
};

const deletePost = async (ctx) => {
  const {res, storage, routeMatch} = ctx;
  console.log(routeMatch);
  await storage.delete(routeMatch.groups.id);
  sendJSONResponse(res, {status: 200, body: {posts: await storage.get()}});
};

export const App = (storage) => {
  const routes = [
    ['GET', '/posts', getPosts],
    ['POST', '/posts', addPost],
    ['DELETE', /\/posts\/(?<id>\d+)$/, deletePost],
  ];
  return (req, res) => {
    let routeMatch;
    const route = routes.find(route => {
      const [method, url] = route;
      routeMatch = req.url.match(url);
      if (routeMatch && req.method === method) {
        return routeMatch;
      };
    });
    if (route) {
      const handler = route[2]
      return handler({req, res, storage, routeMatch});
    }
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("Not Found");
  };
};
