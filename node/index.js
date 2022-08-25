import {createServer} from 'http';
import {App} from './lib/app.js';
import {Storage} from './lib/storage.js';

const storage = Storage();
await storage.reset();
createServer(App(storage)).listen(2000);
