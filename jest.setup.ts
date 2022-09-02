import { chrome } from 'jest-chrome';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// @ts-expect-error we need to set this to use browser polyfill
chrome.runtime.id = 'test id';
Object.assign(global, { chrome });

// We need to require this after we setup jest chrome
// eslint-disable-next-line @typescript-eslint/no-var-requires
const browser = require('webextension-polyfill');
Object.assign(global, { browser });

global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;
