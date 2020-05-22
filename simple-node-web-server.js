const http = require('http');
const url = require('url')
const fs = require('fs');
const qs = require('querystring');
const EventEmitter = require('events');
class Emitter extends EventEmitter {}

var filter = {}

module.exports = {
  hostname : "127.0.0.1",
  port : 3000,

  filterPath: __dirname + "/snws-filter.json",
  publicPath: __dirname + "/public",

  requestEvent: new Emitter(),

  startServer: function (filterPath = this.filterPath, publicPath = this.publicPath, hostname = this.hostname, port = this.port, requestEvent = this.requestEvent) {
    console.log(swsLogPrefix(), "Server has started");
    getFilter(filterPath)
    http.createServer(async function (req, res){
      var u = url.parse(req.url, true)
      var q = url.parse(req.url, true).query;
      var request = u.pathname
      console.log(swsLogPrefix(), "Receieved request!");
      console.log(swsLogPrefix(), request, "\n");




      let requestArray = request.split("/")

      getFilter(filterPath)

      if(filter[request]){
        console.log(swsLogPrefix(), "Request is in filter, sending page to user...");
        console.log(swsLogPrefix(), publicPath + filter[request]);
        if (req.method === "POST"){
          console.log(swsLogPrefix(), "POST REQUEST");
          var body = '';

          req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
                requestEvent.emit('error')
                console.log(swsLogPrefix(),"\x1b[31m","Too much POST data, connection killed! \n","\x1b[0m");
            });

          req.on('end', function () {
            var post = qs.parse(body);
            requestEvent.emit('post',body, req)
            // use post['blah'], etc.
          });
        }
        else if (req.method === "GET" && q){
          console.log(swsLogPrefix(),"GET REQUEST");
          requestEvent.emit('get',q,req)
        }

        try{
          fs.readFile(publicPath + filter[request], function(err, data) {
            if (err) {
              console.error(swsLogPrefix(), "\x1b[31m","There was an error when sending the page!");
              console.error(swsLogPrefix(), "\x1b[0m",err);
              console.error(swsLogPrefix(), "\x1b[31m","Please check the following filter :");
              console.error(swsLogPrefix(), "\x1b[31m",request + ":" + filter[request]);
              console.log(swsLogPrefix(), "Sending an error to the user...","\x1b[0m")
              res.statusCode = 404;
              res.write("404")
              res.end()
            }
            else {
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write(data);
              console.log(swsLogPrefix(), "Page succesfully sent! \n");
              return res.end();
            }
          });

        }
        catch(err){
          console.error(swsLogPrefix(), "\x1b[41m","Catched an error!","\x1b[0m");
          console.error(swsLogPrefix(), err);
          console.log(swsLogPrefix(), "\n");
          res.statusCode = 404;
          res.write("404")
          res.end()
        }
      }

      //resource filter
      else if (requestArray[1]=="resources" || request == "/favicon.ico") {
        console.log(swsLogPrefix(), "Request is a resource request, checking in resource folder...");
        console.log(swsLogPrefix(), publicPath + request);
        if (request == "/favicon.ico") {
          try{
            fs.readFile(publicPath + request, function(err, data) {
              if (err) {
                console.error(swsLogPrefix(), "\x1b[31m","There was an error when sending the favicon!");
                console.error(swsLogPrefix(), "\x1b[0m",err);
                console.error(swsLogPrefix(), "\x1b[31m","Have you added favicon.ico to the public folder?");
                console.error(swsLogPrefix(), "\x1b[31m","Remember, favicon.ico must be in the root of /public");
                console.log(swsLogPrefix(), "Sending 404.","\x1b[0m")
                console.log(swsLogPrefix(), "");
                res.statusCode = 404;
                return res.end()
              }
              else {
                res.statusCode = 200;
                res.write(data);
                console.log(swsLogPrefix(), "Favicon succesfully sent! \n");
                return res.end();
              }
            });
          }
          catch(err){
              console.error(swsLogPrefix(), "\x1b[41m","Catched an error!","\x1b[0m");
              console.error(swsLogPrefix(), err);
              console.log(swsLogPrefix(), "\n");
              res.statusCode = 404;
              res.write("404")
              res.end()
          }
        }
        else{
          try{
            fs.readFile(publicPath + request, function(err, data) {
              if (err) {
                console.error(swsLogPrefix(), "\x1b[31m","There was an error when sending the resource!");
                console.error(swsLogPrefix(), "\x1b[0m",err);
                console.error(swsLogPrefix(), "\x1b[31m","Please check the following request :");
                console.error(swsLogPrefix(), "\x1b[31m",request);
                console.log(swsLogPrefix(), "Sending 404.","\x1b[0m")
                console.log(swsLogPrefix(), "");
                res.statusCode = 404;
                return res.end()
              }
              else {
                res.statusCode = 200;
                res.write(data);
                console.log(swsLogPrefix(), "Resource succesfully sent! \n");
                return res.end();
              }
            });
          }
          catch(err){
              console.error(swsLogPrefix(), "\x1b[41m","Catched an error!","\x1b[0m");
              console.error(swsLogPrefix(), err);
              console.log(swsLogPrefix(), "\n");
              res.statusCode = 404;
              res.write("404")
              res.end()
          }
        }
      }
      else{
        console.log(swsLogPrefix(),"Request is neither a page or a resource, sending 404 error to user...");
        console.log(swsLogPrefix(), "404 : " + request);
        res.statusCode = 404;
        res.write("404")
        res.end()
        console.log(swsLogPrefix(), "");
      }

    }).listen(port)
  }
}

function getFilter(path){
  fs.readFile(path, function(err, data) {
    //console.log(swsLogPrefix(), data);
    filter = JSON.parse(data)
    //console.log(swsLogPrefix(),filter);
  });
  return filter
}

function swsLogPrefix(){
  let d = new Date()
  return "\x1b[36m" + "[SNWS] " + d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate() + 1 + "|" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + "." + d.getMilliseconds() + "\x1b[0m"
}
