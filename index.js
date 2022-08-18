import {createServer} from 'http';
import {App, Storage} from './lib/app.js';

const storage = Storage();
await storage.reset();
createServer(App(storage)).listen(2000);
