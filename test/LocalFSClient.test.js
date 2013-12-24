var LocalFSClient = require('../lib/LocalFSClient.js');
var assert = require('assert');
var path = require('path');
var FSMock = require('./lib/FSMock.js');


function newClient(fsMock) {
	var client = new LocalFSClient({ directory: 'a' });
	client._fs = fsMock.object;

	return client;
}

describe('LocalFSClient', function () {


	describe('saves data to the local fs', function () {

		it('implements put', function () {
			var fsMock = FSMock.create();

			var topic = newClient(fsMock);

			topic.put('key', 'data', function () {});

			assert.strictEqual(fsMock.invocations[0].method, 'writeFile');
			assert.strictEqual(fsMock.invocations[0].arguments[0], path.join('a', 'key'));
			assert.strictEqual(fsMock.invocations[0].arguments[1], 'data');
			assert.strictEqual(typeof(fsMock.invocations[0].arguments[2]), 'function');
		});

		it('implements putFile', function () {
			var fsMock = FSMock.create();

			var topic = newClient(fsMock);

			topic.putFile('key', 'myfile', function () {});

			assert.strictEqual(fsMock.invocations[0].method, 'readFile');
			assert.strictEqual(fsMock.invocations[0].arguments[0], 'myfile');
			assert.strictEqual(typeof(fsMock.invocations[0].arguments[1]), 'function');

			assert.strictEqual(fsMock.invocations[1].method, 'writeFile');
			assert.strictEqual(fsMock.invocations[1].arguments[0], path.join('a', 'key'));
			assert.strictEqual(fsMock.invocations[1].arguments[1], FSMock.FILECONTENT);
			assert.strictEqual(typeof(fsMock.invocations[1].arguments[2]), 'function');
		});

		it.skip('implements putStream', function () {

		});
	});
});

