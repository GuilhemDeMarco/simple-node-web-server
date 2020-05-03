const http = require('http');
const url = require('url')
const fs = require('fs');

var filter = {}

module.exports = {
  hostname : "127.0.0.1",
  port : 3000,
  filterPath:"./sws-filter.json",

  startServer: function (filterPath = this.filterPath, hostname = this.hostname, port = this.port) {
    console.log("Server has started");
    getFilter(filterPath)
    http.createServer(async function (req, res){
      var u = url.parse(req.url, true)
      var q = url.parse(req.url, true).query;
      var request = u.pathname
      console.log("Receieved request!");
      console.log(request);
      console.log("");

      let requestArray = request.split("/")
      
      getFilter(filterPath)


      if(filter[request]){
        console.log("Request is in filter, sending page to user...");
        console.log('./public' + filter[request]);
        try{
          fs.readFile('./public' + filter[request], function(err, data) {
            if (err) {
              console.error("\x1b[31m","There was an error when sending the page!");
              console.error("\x1b[0m",err);
              console.error("\x1b[31m","Please check the following filter :");
              console.error("\x1b[31m",request + ":" + filter[request]);
              console.log("Sending an error to the user...","\x1b[0m")
              res.statusCode = 404;
              res.write("404")
              res.end()
            }
            else {
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write(data);
              return res.end();
              console.log("Page succesfully sent! \n");
            }
          });

        }
        catch(err){
            console.error("There was an error when sending the page!");
            console.error(err);
            console.error("Please check the following filter :");
            console.error(request + ":" + filter[request]);
            console.log("Sending an error to the user...")
            res.statusCode = 404;
            res.write("404")
            res.end()
        }
      }

      //resource filter
      else if (requestArray[1]=="resources" || request == "/favicon.ico") {
        console.log("Request is a resource request, checking in resource folder...");
        if (request == "/favicon.ico") {
            console.log("Requested favicon, sending to user...");
        }
        //send resource
      }
      else{
        console.log("Request is neither a page or a resource, sending 404 error to user...");
        console.log("404 : " + request);
        res.statusCode = 404;
        res.write("404")
        res.end()
        console.log("");
      }

    }).listen(port)
  }
}

/*async function getFilterAsync(path){
  await fs.readFile(path, function(err, data) {
    //console.log(data);
    filter = JSON.parse(data)
    console.log(filter);
  });
  return filter
}*/

function getFilter(path){
  fs.readFile(path, function(err, data) {
    //console.log(data);
    filter = JSON.parse(data)
    console.log(filter);
  });
  return filter
}

//swsttt.startServer()


/*
if(this.filter[request]){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("OK" + request);
  res.end();
}
else{
  res.statusCode = 404;
  res.write("404")
  res.end()
}



var tempFilter = {
  "/":"./pages/index.html",
  "/about":"./pages/about.html"
}

const hostname = "127.0.0.1"
const port = 3000

*/
