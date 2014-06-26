var $l = require('lodash');
var Stubborn = require('stubborn');
var config = require('./config');
var fs = require('fs');
var logarithmicProgression = require('./logarithmicProgression.js');

function AbstractS3Client() {
	this._Stubborn = Stubborn;
	this._progression = logarithmicProgression;	
	this._fs = fs
}

AbstractS3Client.prototype.put = function(key, data, maxAttempts, callback) {
	var task = $l.bind(this._put, this, key, data);
	this._genericPut(task, maxAttempts, callback);
};

AbstractS3Client.prototype.putFile = function(key, file, maxAttempts, callback) {
	var task = $l.bind(this._putFile, this, key, file);
	var self = this

	this._genericPut(task, maxAttempts, function(err) {
		if (err) return callback(err)

		if (config.deleteAfterUpload) 
			self._fs.unlink(file, callback)
		else
			callback.apply(null, arguments)
	});
};

AbstractS3Client.prototype._genericPut = function(task, maxAttempts, callback) {
	if ($l.isFunction(maxAttempts)) {
		callback = maxAttempts;
		maxAttempts = 8;
	}
	var options = {
		maxAttempts: maxAttempts,
		delayProgression: this._progression
	};
	var stubborn = new this._Stubborn(task, options, callback);
	stubborn.run();
};

AbstractS3Client.prototype._put = function(key, data, callback) {
	throw new Error('not implemented');
};

AbstractS3Client.prototype._putFile = function(key, filename, callback) {
	throw new Error('not implemented');
};

AbstractS3Client.prototype.putStream = function(key, stream, callback) {
	throw new Error('not implemented');
};

module.exports = AbstractS3Client;