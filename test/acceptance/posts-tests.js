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

test('Posts API', async t => {
  await t.test('Getting posts', async () => {
    return await new Promise((resolve) => {
      const app = App();
      const request = new TestRequest('GET', '/posts', null);
      let actualStatus;
      const response = {
        writeHead(status, _headers) {
          actualStatus = status;
        },
        end(body) {
          assert.equal(actualStatus, 200);
          assert.deepEqual({posts: []}, JSON.parse(body));
          resolve();
        }
      };
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
      let actualStatus;
      const response = {
        writeHead(status, _headers) {
          actualStatus = status;
        },
        end(body) {
          assert.equal(actualStatus, 201);
          assert.deepEqual({
            posts: [post.date.toISOString()]
          }, JSON.parse(body));
          resolve();
        }
      };
      app(request, response);
    });
  });
});
