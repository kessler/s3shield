var $u = require('util');
var AbstractS3Client = require('./AbstractS3Client.js');
var fs = require('fs');
var config = require('./config.js');
var join = require('path').join;
var EventEmitter = require('events').EventEmitter;

module.exports = FaultyS3Client;

$u.inherits(MockResponse, EventEmitter);
function MockResponse(data) {
	EventEmitter.call(this);
	this.data = data;
}

MockResponse.prototype.read = function() {
	var self = this;

	setTimeout(function () {
		self.emit('end');
	}, 500);

	return this.data;
};

$u.inherits(FaultyS3Client, AbstractS3Client);
function FaultyS3Client(options) {
	AbstractS3Client.call(this);
	this.failures = options.faulty.failures;
	this.directory = options.faulty.directory;
}

FaultyS3Client.prototype._putImpl = function (key, data, callback) {

	if(this.failures-- > 0) {
		console.log('failing deliberately');
		callback('failed');
	} else if (this.directory) {
		fs.writeFile(join(this.directory, key.replace('/', '_')), data, function(err) {
			callback(err, new MockResponse(data));
		});
	} else {
		callback(null, new MockResponse(data));
	}
}

FaultyS3Client.prototype.put = function(key, data, callback) {
	this._putImpl(key, data, callback);
};

FaultyS3Client.prototype.putFile = function(key, file, callback) {
	var self = this;
	fs.readFile(file, function(err, content) {
		self._putImpl(key, content, callback);
	});
};

FaultyS3Client.prototype.putStream = function (key, stream, callback) {
	throw new Error('unsupported');
};

FaultyS3Client.Provider = function () {}

var instance = new FaultyS3Client(config);

FaultyS3Client.Provider.prototype.get = function () {
	return instance;
};