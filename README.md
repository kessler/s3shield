# s3shield [![Build Status](https://secure.travis-ci.org/kessler/s3shield.png?branch=master)](http://travis-ci.org/kessler/s3shield)

small abstraction over various s3 clients

## Install
```
npm install s3shield
```

## Usage
```
var s3shield = require('s3shield');

var clientProvider = s3shield.S3ClientProviderSelector.get('knox'); // can also use 'faulty' to get a client that simulates errors and works against local file system but with same api

var client = clientProvder.get('mybucket');

client.put('mykey', 'mydata', callback);

client.putFile('mykey', 'a/file/some/where.log', callback);

var http = require('http');

http.createServer(function(request, response) {
	client.putStream('myKey', request, function(err) {
		response.end();
	});
}).listen(8080);

```

## Config
```
// .s3shieldrc:

{

	// aws config
	"aws": {
		"region": "us-standard",
		"accessKeyId": "your access key",
		"secretAccessKey": "your secret"
	},

	// see lru-cache for all the options
	// used by knox client provider to catch a client per bucket
	"lru": {
		"max": 100,
		"maxAge": 360000
	},

	// if enabled will gzip a message or a file to local file before uploading

	"gzip": {
		"enabled": false,

		// see http://nodejs.org/api/zlib.html#zlib_options
		"options": undefined,

		// if enabled the unzipped file will be deleted after upload (but not the zipped one)
		// this only applies to file messages
		"deleteFileAfterUpload": false
	},


	// in put() functions where a string or an object is provided (and not a buffer) this enconding
	// will be used when turning the data into a buffer
	"uploadEncoding": "utf8",

	// "faulty s3 client is used for testing"
	"faulty": {

		// how many time should I fail
		"failures": 3
	}
}
```
see [RC module](https://github.com/dominictarr/rc) for further details

### Message format
```
	{
		"bucket": "name of the bucket",
		"key": "path in the bucket",
		"data": "some data to write",
		"url": "instead of embedding the data in the message, zero-s3 will issue an http request to get this data and upload to s3 - not implemented fully yet"
		"path": "instead of embedding the data in the message, zero-s3 will upload a local file to s3"
	}
```
***if both url and data exist in the message, there is no guarentee which will take effect***

## Example
```javascript
_(Coming soon)_
```

## Documentation
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Yaniv Kessler. Licensed under the MIT license.
