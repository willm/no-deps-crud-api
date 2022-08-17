import test from 'node:test';
import * as assert from 'assert';
import {App} from '../../lib/app.js';
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
  await t.test('Getting posts', async () => {
    return await new Promise((resolve) => {
      const app = App();
      const request = new TestRequest('GET', '/posts', null);
      const response = new AssertingResponse(200, {posts: []}, resolve);
      app(request, response);
    });
  });

  await t.test('add a post', async _ => {
    return await new Promise((resolve) => {
      const app = App();
      const post = {
        title: '🍦 Node JS is fun',
        date: new Date(),
        body: 'Writing a CRUD api in pure node'
      };
      const request = new TestRequest(
        'POST',
        '/posts',
        JSON.stringify(post)
      );
      const response = new AssertingResponse(201, {
        posts: [post.date.toISOString()]
      }, resolve);
      app(request, response);
    });
  });
});
