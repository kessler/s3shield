var assert = require('assert');
var Message = require('../lib/Message.js');

describe('Message', function () {

	it('is created using a payload', function () {

		var message = Message.create({ data: '123' });

		assert.strictEqual(message.payload.data, '123');
	});

	describe('changes the upload behavior according to the payload', function () {

		it('uses put when payload contains data', function (done) {

			var client = new Mock();

			var payload = { data: '123' };

			var message = new Message(payload);

			message.upload(client, function(err) {
				assert.strictEqual(client.invocations.length, 1);
				var invocation = client.invocations[0];
				assert.strictEqual(invocation[0], 'put');
				assert.strictEqual(invocation[1][1], '123');
				done();
			});
		});

		it('uses putFile when payload contains a path ', function(done) {
			var client = new Mock();

			var payload = { path: '123' };

			var message = new Message(payload);

			message.upload(client, function(err) {

				assert.strictEqual(client.invocations.length, 1);

				var invocation = client.invocations[0];

				assert.strictEqual(invocation[0], 'putFile');
				assert.strictEqual(invocation[1][1], '123');

				done();
			});
		});

		it('increment upload attemps counter when upload fails', function (done) {
			var client = new Mock();

			client.put = function(k, d, c) {
				c('error!');
			};

			var payload = { data: '123' };

			var message = new Message(payload);

			message.upload(client, function(err) {

				assert.strictEqual(message.uploadAttempts, 1);

				done();
			});
		});
	});
});

function Mock() {
	this.invocations = [];
}

Mock.prototype.put = function(key, data, callback) {
	this.invocations.push(['put', arguments]);
	callback(null);
};

Mock.prototype.putFile = function(key, path, callback) {
	this.invocations.push(['putFile', arguments]);
	callback(null);
};