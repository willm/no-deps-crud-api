import test from 'node:test';
import * as assert from 'assert';
import {App} from '../../lib/app.js';
import {Storage} from '../../lib/storage.js';
import {Readable} from 'stream';

class TestRequest extends Readable {
  url;
  method;
  body;
  constructor(method, path, body, opts) {
    super(opts);
    this.url = path;
    this.method = method;
    this.body = body;
  }
  url
  _read() {
    this.push(this.body);
    this.push(null);
  }
}

class AssertingResponse {
  #actualStatus;
  #expectedStatus;
  #expectedBody;
  #end;
  constructor(expectedStatus, expectedBody, end) {
    this.#expectedStatus = expectedStatus;
    this.#expectedBody = expectedBody;
    this.#end = end;
  }

  writeHead(status, _headers) {
    this.#actualStatus = status;
  }

  end(body) {
    assert.equal(this.#actualStatus, this.#expectedStatus);
    assert.deepEqual(this.#expectedBody, JSON.parse(body));
    this.#end();
  }
}

test('Posts API', async t => {
  const storage = Storage();
  await t.test('Listing posts', async () => {
    await storage.reset();
    const date = new Date().getTime();
    const post = {
      title: '🍦 Node JS is fun',
      date,
      body: 'Writing a CRUD api in pure node'
    };
    await storage.add(post)
    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest('GET', '/posts', null);
      const response = new AssertingResponse(200, {posts: [date]}, resolve);
      app(request, response);
    });
  });

  await t.test('Adding a post', async _ => {
    await storage.reset();
    return await new Promise((resolve) => {
      const date = new Date().getTime();
      const app = App(storage);
      const post = {
        title: '🍦 Node JS is fun',
        date,
        body: 'Writing a CRUD api in pure node'
      };
      const request = new TestRequest(
        'POST',
        '/posts',
        JSON.stringify(post)
      );
      const response = new AssertingResponse(201, {
        posts: [post.date]
      }, resolve);
      app(request, response);
    });
  });

  await t.test('Adding a post with invalid JSON', async _ => {
    await storage.reset();
    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest(
        'POST',
        '/posts',
        '{..some_in£#!valid'
      );
      const response = new AssertingResponse(400, {
        message: 'Post must be valid JSON'
      }, resolve);
      app(request, response);
    });
  });

  await t.test('Adding a post with an invalid schema', async _ => {
    await storage.reset();
    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest(
        'POST',
        '/posts',
        JSON.stringify({wobble: 5, shnozzle: 'definitely'})
      );
      const response = new AssertingResponse(400, {
        message: 'Post must conform to post schema'
      }, resolve);
      app(request, response);
    });
  });

  await t.test('Deleting a post', async _ => {
    await storage.reset();
    const date = new Date().getTime();
    const post = {
      title: '🍦 Node JS is fun',
      date,
      body: 'Writing a CRUD api in pure node'
    };
    await storage.add(post)
    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest(
        'DELETE',
        `/posts/${date}`
      );
      const response = new AssertingResponse(200, {
        posts: []
      }, resolve);
      app(request, response);
    });
  });

  await t.test('Modifying a post', async _ => {
    await storage.reset();
    const date = new Date().getTime();
    const post = {
      title: '🍦 Node JS is fun',
      date,
      body: 'Writing a CRUD api in pure node'
    };
    await storage.add(post)

    post.title = 'Amended title';

    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest(
        'PUT',
        `/posts`,
        JSON.stringify(post)
      );
      const response = new AssertingResponse(200, {
        posts: [
          date
        ]
      }, resolve);
      app(request, response);
    });
  });

  await t.test('Modifying a post with invalid JSON', async _ => {
    await storage.reset();
    const date = new Date().getTime();
    const post = {
      title: '🍦 Node JS is fun',
      date,
      body: 'Writing a CRUD api in pure node'
    };
    await storage.add(post)

    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest(
        'PUT',
        `/posts`,
        's0mEGarbage}}.'
      );
      const response = new AssertingResponse(400, {
        message: 'Post must be valid JSON'
      }, resolve);
      app(request, response);
    });
  });

  await t.test('Modifying a post an with invalid schema', async _ => {
    await storage.reset();
    const date = new Date().getTime();
    const post = {
      title: '🍦 Node JS is fun',
      date,
      body: 'Writing a CRUD api in pure node'
    };
    await storage.add(post)

    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest(
        'POST',
        '/posts',
        JSON.stringify({wobble: 5, shnozzle: 'definitely'})
      );
      const response = new AssertingResponse(400, {
        message: 'Post must conform to post schema'
      }, resolve);
      app(request, response);
    });
  });

  await t.test('Geting a post', async _ => {
    await storage.reset();
    const date = new Date().getTime();
    const post = {
      title: '🍦 Node JS is fun',
      date,
      body: 'Writing a CRUD api in pure node'
    };
    await storage.add(post)

    return await new Promise((resolve) => {
      const app = App(storage);
      const request = new TestRequest(
        'GET',
        `/posts/${date}`
      );
      const response = new AssertingResponse(
        200,
        JSON.stringify(post), resolve
      );
      app(request, response);
    });
  });
});
