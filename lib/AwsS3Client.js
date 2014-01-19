
var $l = require('lodash');
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

	this._fs = fs;

	this._client = new aws.S3({
	    accessKeyId: awsOptions.accessKeyId,
	  	secretAccessKey: awsOptions.secretAccessKey,
	  	bucket: awsOptions.bucket,
	  	region: awsOptions.region,
	  	endpoint: awsOptions.endpoint
	});

	this._bucket = awsOptions.bucket;
}

AwsS3Client.prototype.put = function(key, data, callback) {
	if (!Buffer.isBuffer(data)) {
		data = new Buffer(JSON.stringify(data), config.uploadEncoding);
	}
	var putObjectOptions = {
		Key: key,
		Bucket: this._bucket,
		Body: data
	};
	var request = this._client.putObject(putObjectOptions);
	var onSuccess = $l.bind(this._onSuccess, this, callback);
	request.on('error', this.retry ? this.retry(key, data, callback) : callback);
	request.on('success', onSuccess);
	request.send();
};

AwsS3Client.prototype._onSuccess = function(callback) {
	callback(null);
};

AwsS3Client.prototype.putFile = function(key, file, callback) {
	var onFileRead = $l.bind(this._onFileRead, this, key, callback);
	this._fs.readFile(file, onFileRead);
};

AwsS3Client.prototype._onFileRead = function(key, callback, err, data) {
	if (err) {
		callback(err);
		return;
	}
	this.put(key, callback);
};

module.exports = AwsS3Client;
