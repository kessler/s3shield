
var $l = require('lodash');

function StreamToBuffer(readable, callback) {
	if (this instanceof StreamToBuffer) {
		this._readable = readable;
		this._chunks = [];
		this._callback = callback;
		return;
	}
	var streamToBuffer = new StreamToBuffer(readable, callback);
	streamToBuffer.start();
}

StreamToBuffer.prototype.start = function() {
	var readable = this._readable;
	readable.on('readable', $l.bind(this._onReadable, this));
	readable.on('end', $l.bind(this._onEnd, this));
	readable.on('error', this._callback);
};

StreamToBuffer.prototype._onReadable = function() {
	console.log('_onReadable');
	var readable = this._readable;
	var chunks = this._chunks;
	var chunk;
	while ((chunk = readable.read()) !== null) {
		chunks.push(chunk);
	}
};

StreamToBuffer.prototype._onEnd = function() {
	console.log('_onEnd');
	var buffer = Buffer.concat(this._chunks);
	this._callback(null, buffer);
};

module.exports = StreamToBuffer;
