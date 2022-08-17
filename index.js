import {createServer} from 'http';
import {App} from './lib/app';

createServer(App()).listen(2000);
