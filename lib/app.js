const sendJSONResponse = (res, options) => {
  res.writeHead(options.status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(options.body));
};

const readJSONRequestBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', data => body += data.toString('utf8'));
    req.on('end', async () => {
      resolve(JSON.parse(body));
    });
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
  const post = await readJSONRequestBody(req);
  await storage.add(post);
  sendJSONResponse(res, {status: 201, body: {posts: await storage.list()}});
};

const updatePost = async (ctx) => {
  const {req, res, storage} = ctx;
  const post = await readJSONRequestBody(req);
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
    ['DELETE', /\/posts\/(?<id>\d+)$/, deletePost],
    ['GET', /\/posts\/(?<id>\d+)$/, getPost],
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
