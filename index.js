import {createServer} from 'http';

const getPosts = (_req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    posts: []
  }));
}

const app = () => {
  const routes = [
    ['GET', '/posts', getPosts],
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

createServer(app()).listen(2000);
