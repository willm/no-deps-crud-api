import {Storage} from './storage';

type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';
type HTTPHandler = (request: Request) => Response | Promise<Response>;
type Route = [
  method: HTTPMethod,
  pathMatcher: string | RegExp,
  handler: HTTPHandler
];

const storage = Storage();

const listPosts: HTTPHandler = (_request: Request) => {
  const posts = storage.list();
  return new Response(JSON.stringify({posts}), {
    status: 200,
    headers: {'Content-Type': 'application/json'}
  });
}

const routes: Route[] = [
  ['GET', /\/posts$/, listPosts],
];

export default {
  port: 3000,
  fetch(request: Request) {
    const {pathname} = new URL(request.url);
    const method = request.method;
    const route = routes.find(route => {
      const [routeMethod, pathMatcher] = route;
      return method === routeMethod && pathname.match(pathMatcher);
    });
    if (route) {
      return route[2](request);
    }
    return new Response("Hello World");
  },
};
