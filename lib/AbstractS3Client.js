var $l = require('lodash');

var Stubborn = require('stubborn');

function AbstractS3Client() {
	this._Stubborn = Stubborn;
}

AbstractS3Client.prototype.put = function(key, data, maxAttempts, callback) {
	if ($l.isFunction(maxAttempts)) {
		this._put(key, data, maxAttempts);
		return;
	}
	var task = $l.bind(this._put, this, key, data);
	var options = { maxAttempts: maxAttempts };
	var stubborn = new this._Stubborn(task, options, callback);
	stubborn.run();
};

AbstractS3Client.prototype.putFile = function(key, file, maxAttempts, callback) {
	if ($l.isFunction(maxAttempts)) {
		this._putFile(key, file, maxAttempts);
		return;
	}
	var task = $l.bind(this._putFile, this, key, file);
	var options = { maxAttempts: maxAttempts };
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