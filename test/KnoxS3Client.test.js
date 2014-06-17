var assert = require('assert');
var KnoxS3Client = require('../lib/KnoxS3Client.js');
var PolyMock = require('polymock');
var config = require('../lib/config.js');

function createKnoxMock(requestMock) {
	var mock = PolyMock.create();

	mock.createMethod('put', requestMock.object);

	return mock;
}

function createRequestMock() {
	var mock = PolyMock.create();

	mock.createEventEmitter();

	mock.createMethod('end');

	return mock;
}

describe('KnoxS3Client', function () {

	describe('put()s a piece of data into s3', function() {

		it('put()s a string', function (done) {

			console.log(config.aws);

			var client = new KnoxS3Client(config.aws, config.gzip, config.uploadEncoding);

			var requestMock = createRequestMock();

			var knoxMock = createKnoxMock(requestMock);

			var expectedResponse = { statusCode: 200 };

			var data = 'data123';

			client._client = knoxMock.object;

			client.put('my/key', data, function(err, actualResponse) {

				assert.ok(!err);
				assert.strictEqual(expectedResponse, actualResponse);
				assert.strictEqual(actualResponse.statusCode, 200);

				// knox client method calls
				assert.strictEqual(knoxMock.invocations.length, 1);
				assert.strictEqual(knoxMock.invocations[0].method, 'put');
				assert.strictEqual(knoxMock.invocations[0].arguments[0], 'my/key');

				var actualHeaders = knoxMock.invocations[0].arguments[1];
				assert.deepEqual(actualHeaders['Content-Length'], Buffer.byteLength(data));
				assert.deepEqual(actualHeaders['Content-Type'], 'application/json');

				// request method calls
				assert.strictEqual(requestMock.invocations[0].method, 'on');
				assert.strictEqual(requestMock.invocations[0].arguments[0], 'response');
				assert.strictEqual(typeof requestMock.invocations[0].arguments[1], 'function');

				assert.strictEqual(requestMock.invocations[1].method, 'on');
				assert.strictEqual(requestMock.invocations[1].arguments[0], 'error');
				assert.strictEqual(typeof requestMock.invocations[1].arguments[1], 'function');

				assert.strictEqual(requestMock.invocations[2].method, 'end');
				assert.deepEqual(requestMock.invocations[2].arguments[0], new Buffer(data));

				done();
			});

			requestMock.emitter.emit('response', expectedResponse);
		});

		it('put()s a buffer', function (done) {
			var client = new KnoxS3Client(config.aws, config.gzip, config.uploadEncoding);

			var requestMock = createRequestMock();

			var knoxMock = createKnoxMock(requestMock);

			var expectedResponse = { statusCode: 200 };

			var data = 'data123';

			var expectedData = new Buffer(data);

			client._client = knoxMock.object;

			client.put('my/key', expectedData, function(err, actualResponse) {

				assert.ok(!err);
				assert.strictEqual(expectedResponse, actualResponse);
				assert.strictEqual(actualResponse.statusCode, 200);

				assert.strictEqual(requestMock.invocations[2].arguments[0], expectedData);

				done();
			});

			requestMock.emitter.emit('response', expectedResponse);
		});
	});
});