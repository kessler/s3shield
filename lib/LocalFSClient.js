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

	var self = this;

	function writeFsCallback(err) {
		callback(err, new MockResponse(data));
	}

	function write(err) {
		if (err) return callback(err);

		self._fs.writeFile(join(self.directory, key.replace('/', '_')), data, writeFsCallback);
	}

	if (!this._directoryExists) {
		this._verifyDirectory(write);
	} else {
		write();
	}
};

LocalFSClient.prototype._verifyDirectory = function(callback) {
	var self = this;

	function existsCallback(exists) {
		self._directoryExists = true;

		if (exists) {
			callback();
		} else {
			self._fs.mkdir(self.directory, callback);
		}
	}

	this._fs.exists(this.directory, existsCallback);
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

LocalFSClient.Provider.prototype.get = function (directory) {

	return new LocalFSClient({ directory: directory });
};