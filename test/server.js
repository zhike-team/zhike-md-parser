/**
 * Created by du on 16/12/7.
 */
'use strict'
let http = require('http');
let fs = require('fs');
let path = require('path');
const PORT = 8888;

http.createServer(function(req, res){
	if (req.url === '/browser.html'){
		fs.readFile(path.resolve(__dirname, './browser.html'), function (err, file) {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(file, "binary");
			res.end();
		})
	}else if (req.url === '/index.js'){
		fs.readFile(path.resolve(__dirname, '../index.js'), function (err, file) {
			res.writeHead(200, {'Content-Type': 'text/plan'});
			res.write(file, "binary");
			res.end();
		})
	}else {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('NOT FOUND');
		res.end();
	}
}).listen(PORT, function(err){
	console.log('test server start at: ' + PORT)
});

