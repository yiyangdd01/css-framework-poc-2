const https = require('https')

https.createServer({}, function (req, res) {
  res.writeHead(200)
  res.end('hello world\n')
}).listen(8000)
