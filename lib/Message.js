var $u = require('util');

module.exports = Message;

function Message(payload) {
	if (payload.data) {
		this.upload = uploadData;
	} else if (payload.url) {
		this.upload = uploadUrl;
	} else if (payload.path) {
		this.upload = uploadFile;
	} else {
		throw new Error('missing url or data or path');
	}

	this.payload = payload;
	this.uploadAttempts = 0;
}

function uploadCallbackFactory(message, userCallback) {
	return function cb(err, res) {
		if (err) message.uploadAttempts++;
		userCallback(err, res, message);
	};
}

Message.prototype.upload = function(client, uploadCallback) {
	throw new Error('not implemented');
};

function uploadData(client, callback) {
	client.put(this.payload.key, this.payload.data, uploadCallbackFactory(this, callback));
}

function uploadFile(client, callback) {
	client.putFile(this.payload.key, this.payload.path, uploadCallbackFactory(this, callback));
}

function uploadUrl(client, callback) {
	throw new Error('not implemented');
}

Message.create = function (payload) {
	return new Message(payload);
};
