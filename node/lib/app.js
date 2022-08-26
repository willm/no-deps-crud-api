import {randomUUID as uuid} from 'crypto';
import {validatePost} from './validation.js';

const sendJSONResponse = (options, res) => {
  res.writeHead(options.status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(options.body));
};

const sendInvalidJSONResponse = sendJSONResponse.bind(
  null, {status: 400, body: {message: 'Post must be valid JSON'}}
);

const sendInvalidSchemaResponse = sendJSONResponse.bind(
  null, {status: 400, body: {message: 'Post must conform to post schema'}}
);

const readJSONRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', data => body += data.toString('utf8'));
    req.on('end', async () => {
      try {
        resolve(JSON.parse(body));
      } catch(err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
};

const getPost = async (ctx) => {
  const {res, storage, routeMatch} = ctx;
  const post = await storage.get(routeMatch.groups.id);
  sendJSONResponse({status: 200, body: post}, res);
};

const listPosts = async (ctx) => {
  const {res, storage} = ctx;
  sendJSONResponse({status: 200,  body: { posts: await storage.list() }}, res);
};

const saveOrUpdatePost = async (id, successStatus, ctx) => {
  const {req, res, storage} = ctx;
  let post;
  try {
    post = await readJSONRequestBody(req);
  } catch (err) {
    return sendInvalidJSONResponse(res);
  }
  try {
    validatePost(post);
  } catch (err) {
    return sendInvalidSchemaResponse(res);
  }
  await storage.add(id, post);
  sendJSONResponse({status: successStatus, body: {posts: await storage.list()}}, res);
};

const savePost = async (ctx) => {
  await saveOrUpdatePost(uuid(), 201, ctx);
};

const updatePost = async (ctx) => {
  await saveOrUpdatePost(ctx.routeMatch.groups.id, 200, ctx);
};

const deletePost = async (ctx) => {
  const {res, storage, routeMatch} = ctx;
  await storage.delete(routeMatch.groups.id);
  sendJSONResponse({status: 200, body: {posts: await storage.list()}}, res);
};

export const App = (storage) => {
  const matchUUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  const routes = [
    ['GET', /\/posts$/, listPosts],
    ['POST', '/posts', savePost],
    ['DELETE', new RegExp(`/posts/(?<id>${matchUUID})$`), deletePost],
    ['GET', new RegExp(`/posts/(?<id>${matchUUID})$`), getPost],
    ['PUT', new RegExp(`/posts/(?<id>${matchUUID})$`), updatePost],
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
