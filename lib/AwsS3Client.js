var $u = require('util');
var AbstractS3Client = require('./AbstractS3Client.js');
var knox = require('knox');
var assert = require('assert');
var fs = require('fs');
var zlib = require('zlib');
var config = require('./config.js');
var domain = require('domain');
var aws = require('aws-sdk');


$u.inherits(AwsS3Client, AbstractS3Client);
function AwsS3Client(awsOptions) {
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

AwsS3Client.prototype.put = function(key, data, callback) {
	if (!Buffer.isBuffer(data)) {
		data = new Buffer(JSON.stringify(data), config.uploadEncoding);
	}

	if (config.gzip.enabled) {
		key = key + '.gz';
	}

	if (this.retry)
		request.on('error', retry(this, key, data, callback));
	else
		request.on('error', callback);

	var length
	self._s3.putObject({
        Body: Buffer.concat(flushOp.buffer, flushOp.bufferLength),
        Key: flushOp.filename,
        Bucket: self._awsOptions.bucket
    }, callback);
};

AwsS3Client.prototype.putFile = function(key, file, callback) {

};

AwsS3Client.prototype.putStream = function(key, stream, headers, callback) {

};

module.exports = AwsS3Client;