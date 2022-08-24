import {validatePost} from './validation.js';
const INVALID_JSON = 'Post must be valid JSON';
const INVALID_SCHEMA = 'Post must conform to post schema';

const sendJSONResponse = (res, options) => {
  res.writeHead(options.status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(options.body));
};

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
  sendJSONResponse(res, {status: 200, body: post});
};

const listPosts = async (ctx) => {
  const {res, storage} = ctx;
  sendJSONResponse(res, {status: 200,  body: { posts: await storage.list() }});
};

const addPost = async (ctx) => {
  const {req, res, storage} = ctx;
  let post;
  try {
    post = await readJSONRequestBody(req);
  } catch (err) {
    return sendJSONResponse(res, {status: 400, body: {message: INVALID_JSON}});
  }
  try {
    validatePost(post);
  } catch (err) {
    return sendJSONResponse(res, {status: 400, body: {message: INVALID_SCHEMA}});
  }
  await storage.add(post);
  sendJSONResponse(res, {status: 201, body: {posts: await storage.list()}});
};

const updatePost = async (ctx) => {
  const {req, res, storage} = ctx;
  let post;
  try {
    post = await readJSONRequestBody(req);
  } catch (err) {
    return sendJSONResponse(res, {status: 400, body: {message: INVALID_JSON}});
  }
  try {
    validatePost(post);
  } catch (err) {
    return sendJSONResponse(res, {status: 400, body: {message: INVALID_SCHEMA}});
  }
  await storage.add(post);
  sendJSONResponse(res, {status: 200, body: {posts: await storage.list()}});
};

const deletePost = async (ctx) => {
  const {res, storage, routeMatch} = ctx;
  await storage.delete(routeMatch.groups.id);
  sendJSONResponse(res, {status: 200, body: {posts: await storage.list()}});
};

export const App = (storage) => {
  const routes = [
    ['GET', /\/posts$/, listPosts],
    ['POST', '/posts', addPost],
    [
      'DELETE',
      /\/posts\/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/,
      deletePost
    ],
    [
      'GET',
      /\/posts\/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/,
      getPost
    ],
    ['PUT', '/posts', updatePost],
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
