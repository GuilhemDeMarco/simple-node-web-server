const snws = require('./simple-node-web-server.js');
const { on, EventEmitter } = require('events');


snws.startServer();
console.log("ae");

snws.requestEvent.on('post', (body, req) => {
  console.log(body);
});
snws.requestEvent.on('get', (body, req) => {
  console.log(body);
});
