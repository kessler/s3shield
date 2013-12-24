var $u = require('util');
var LocalFSClient = require('./LocalFSClient.js');
var fs = require('fs');
var config = require('./config.js');
var join = require('path').join;

module.exports = FaultyS3Client;

$u.inherits(FaultyS3Client, LocalFSClient);
function FaultyS3Client(options) {
	LocalFSClient.call(this, options);
	this.failures = options.failures;
}

FaultyS3Client.prototype._putImpl = function (key, data, callback) {

	if(this.failures-- > 0) {
		console.log('failing deliberately');
		return callback('failed');
	} else {
		if (this.directory) {
			LocalFSClient.prototype._putImpl.call(this, key, data, callback);
		} else {
			callback(null, new LocalFSClient.MockResponse(data));
		}
	}


}

FaultyS3Client.Provider = function () {}

var instance = new FaultyS3Client(config.faulty);

FaultyS3Client.Provider.prototype.get = function () {
	return instance;
};