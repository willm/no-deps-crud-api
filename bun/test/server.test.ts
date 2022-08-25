import server from '../index';
import {Storage} from '../storage';
import { describe, expect, it } from "bun:test";

describe('Post API', () => {
  it('lists all the posts', async () => {
    const storage = Storage();
    storage.reset();
    const post = {
      date: new Date('2022-08-25T21:35:00.000Z'),
      title: 'Hello Bun',
      body: 'I wrote my first application in Bun',
      id: 1
    };
    storage.add(post);

    const response = await server.fetch(
      new Request('http://localhost:3000/posts', {method: 'GET'})
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
    const body = await response.json();
    expect(body.posts).toHaveLength(1);
    expect(body.posts[0]).toBe(1);
  });
});
