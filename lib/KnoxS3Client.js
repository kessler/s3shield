var $u = require('util');
var AbstractS3Client = require('./AbstractS3Client.js');
var knox = require('knox');
var assert = require('assert');
var fs = require('fs');
var zlib = require('zlib');
var config = require('./config.js');
var domain = require('domain');

$u.inherits(KnoxS3Client, AbstractS3Client);
function KnoxS3Client(awsOptions) {
	AbstractS3Client.call(this);

	this._client = knox.createClient({
	    key: 		awsOptions.accessKeyId,
	  	secret: 	awsOptions.secretAccessKey,
	  	bucket: 	awsOptions.bucket,
	  	region: 	awsOptions.region,
	  	endpoint: 	awsOptions.endpoint
	});
}

function onResponse (callback) {

	return function onResponseImpl(res) {

		if (200 === res.statusCode) {
			callback(null, res);
		} else {
			callback(new Error('response error ' + res.statusCode), res);
		}
	}
}

KnoxS3Client.prototype.put = function(key, data, callback) {

	if (!Buffer.isBuffer(data)) {
		data = new Buffer(JSON.stringify(data), config.uploadEncoding);
	}

	var length = data.length;

	if (config.gzip.enabled)
		key = key + '.gz';

	var request = this._client.put(key, {
		'Content-Length': length,
		'Content-Type': 'application/json'
	});

	request.on('response', onResponse(callback));
	request.on('error', callback);

	if (config.gzip.enabled) {
		var gzip = zlib.createGzip(config.gzip.options);

		gzip.write(data);
		gzip.pipe(request);
	} else {
		request.end(data);
	}
};

KnoxS3Client.prototype.putFile = function(key, file, callback) {

	var self = this;
	if (config.gzip.enabled) {
		var gzip = zlib.createGzip(config.gzip.options);

		var unzippedFile = file;
		file = file + '.gz';
		key = key + '.gz';

		var gzippedFile = fs.createWriteStream(file);

		fs.createReadStream(unzippedFile).pipe(gzip).pipe(gzippedFile);

		gzippedFile.on('finish', gzipDoneCB);

		function gzipDoneCB() {

			var d = domain.create();

			d.run(function () {
				self._client.putFile(file, key, putFileDoneCB);
			});

			d.on('error', function (error) {
				console.error(error);
			});
		}

		function putFileDoneCB(err) {
			if (err) return callback(err);

			console.log('%s was gzipped and uploaded to s3 successfully', unzippedFile);

			if (config.gzip.deleteFileAfterUpload) {
				console.log('deleting %s, retaining %s', unzippedFile, file);
				fs.unlink(unzippedFile, callback);
			}else{
				callback();
			}
		}

	} else {
		var d = domain.create();

		d.run(function () {
			self._client.putFile(file, key, callback);
		});

		d.on('error', function (error) {
			console.error(error, 'domain');
		});
	}

};

KnoxS3Client.prototype.putStream = function(key, stream, headers, callback) {
	var self = this;
	var d = domain.create();

	d.run(function () {
		self._client.putStream(stream, key, headers, callback);
	});

	d.on('error', function (error) {
		console.error(error, 'domain');
	});
};

module.exports = KnoxS3Client;