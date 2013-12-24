var $u = require('util');
var AbstractS3Client = require('./AbstractS3Client.js');
var fs = require('fs');
var join = require('path').join;
var EventEmitter = require('events').EventEmitter;

module.exports = LocalFSClient;

$u.inherits(LocalFSClient, AbstractS3Client);
function LocalFSClient(options) {
	AbstractS3Client.call(this);
	this.directory = options.directory;
	this.streamsWritten = 0;
	this._fs = fs;
}

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

LocalFSClient.MockResponse = MockResponse;

LocalFSClient.prototype._putImpl = function (key, data, callback) {

	this._fs.writeFile(join(this.directory, key.replace('/', '_')), data, function(err) {
		callback(err, new MockResponse(data));
	});
};

LocalFSClient.prototype.put = function(key, data, callback) {
	this._putImpl(key, data, callback);
};

LocalFSClient.prototype.putFile = function(key, file, callback) {
	var self = this;
	this._fs.readFile(file, function(err, content) {
		self._putImpl(key, content, callback);
	});
};

LocalFSClient.prototype.putStream = function (key, stream, callback) {
	this.streamsWritten++;
	var filename = join(this.directory, 'stream' + this.streamsWritten.toString());
	var fstream = this._fs.createWriteStream(filename);

	// might be called twice ????
	fstream.on('finish', callback);
	fstream.on('error', callback);

	stream.pipe(fstream);
};

LocalFSClient.Provider = function () {}

LocalFSClient.Provider.prototype.get = function () {
	return new LocalFSClient();
};