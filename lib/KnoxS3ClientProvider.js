var LRUCache = require('lru-cache');
var KnoxS3Client = require('./KnoxS3Client.js');
var _l = require('lodash');
var config = require('./config.js');
/*
	this provider caches knox s3 clients using an lru cache
	that discards clients based on time and space.
*/
function Provider(_config) {
	_config = _config || config;

	this._cache = LRUCache(_config.lru);
	this._awsOptions = _config.aws;
}

Provider.prototype.get = function(bucket) {
	var client = this._cache.get(bucket);

	if (!client) {
		var options = _l.clone(this._awsOptions);

		options.bucket = bucket;

		client = new KnoxS3Client(options, config.gzip, config.uploadEncoding);

		this._cache.set(bucket, client);

		console.log('initialized client for bucket %s', bucket);
	}

	return client;
};

module.exports = Provider;