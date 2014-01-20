
var $l = require('lodash');
var $u = require('util');
var AbstractS3Client = require('./AbstractS3Client.js');
var knox = require('knox');
var assert = require('assert');
var fs = require('fs');
var zlib = require('zlib');
var domain = require('domain');
var aws = require('aws-sdk');

var StreamToBuffer = require('./StreamToBuffer.js');

$u.inherits(AwsS3Client, AbstractS3Client);

function AwsS3Client(awsOptions, gzipOptions, uploadEncoding) {
	AbstractS3Client.call(this);
	this._zlib = zlib;
	this._domain = domain;
	this._fs = fs;
	this._StreamToBuffer = StreamToBuffer;
	this._client = new aws.S3({
	    accessKeyId: awsOptions.accessKeyId,
	  	secretAccessKey: awsOptions.secretAccessKey,
	  	bucket: awsOptions.bucket,
	  	region: awsOptions.region,
	  	endpoint: awsOptions.endpoint
	});
	this._gzipOptions = gzipOptions;
	this._uploadEncoding = uploadEncoding;
	this._bucket = awsOptions.bucket;
}

AwsS3Client.prototype.put = function(key, data, callback) {
	if (!Buffer.isBuffer(data)) {
		data = new Buffer(JSON.stringify(data), this._uploadEncoding);
	}
	var putObjectOptions = { Bucket: this._bucket };
	if (this._gzipOptions.enabled) {
		putObjectOptions.Key = key + '.gz';
		putObjectOptions.ContentEncoding = 'gzip';
		var gzip = this._zlib.createGzip(this._gzipOptions.options);
		var onGzipped = $l.bind(this._onGzipped, this, putObjectOptions, key, data, callback);
		var streamToBuffer = new this._StreamToBuffer(gzip, onGzipped);
		streamToBuffer.start();
		gzip.end(data);
	} else {
		putObjectOptions.Key = key;
		putObjectOptions.Body = data;
		this._requestInDomain(putObjectOptions, key, data, callback);
	}
};

AwsS3Client.prototype._onGzipped = function(putObjectOptions, key, data, callback, err, gzipedData) {
	if (err) {
		callback(err);
		return;
	}
	putObjectOptions.Body = gzipedData;
	this._requestInDomain(putObjectOptions, key, data, callback);
};

AwsS3Client.prototype._requestInDomain = function(putObjectOptions, key, data, callback) {
	var request = $l.bind(this._request, this, putObjectOptions, key, data, callback);
	var d = this._domain.create();
	d.on('error', callback);
	d.run(request);
};

AwsS3Client.prototype._request = function(putObjectOptions, key, data, callback) {
	var request = this._client.putObject(putObjectOptions);
	request.on('error', this.retry ? this.retry(key, data, callback) : callback);
	var onSuccess = $l.partial(callback, null);
	request.on('success', onSuccess);
	request.send();
};

AwsS3Client.prototype.putFile = function(key, file, callback) {
	//var onFileRead = $l.bind(this._onFileRead, this, key, callback);
	//this._fs.readFile(file, onFileRead);
	throw new Error('not implemented');
};

AwsS3Client.prototype._onFileRead = function(key, callback, err, data) {
	if (err) {
		callback(err);
		return;
	}
	this.put(key, data, callback);
};

module.exports = AwsS3Client;
