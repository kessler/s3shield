function AbstractS3Client() {
}

AbstractS3Client.prototype.put = function(key, data, callback) {
	throw new Error('not implemented');
};

AbstractS3Client.prototype.putFile = function(key, filename, callback) {
	throw new Error('not implemented');
};

AbstractS3Client.prototype.list = function(bucket) {
	throw new Error('not implemented');
};

module.exports = AbstractS3Client;