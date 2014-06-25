var FaultyS3Client = require('../lib/FaultyS3Client.js');
var assert = require('assert');
var FSMock = require('./lib/FSMock.js');

describe('FaultyS3Client', function () {
	it('fails uploads in a predictable and predefined manner', function () {

		var client = new FaultyS3Client({ directory: 'a', failures: 2 });

		var fsMock = FSMock.create();

		client._fs = fsMock.object;

		var errors = 0;

		function cb (err) {

			if (err) {
				errors++;
			}
		}

		client.put('k', 'd', 0, cb);
		client.put('k', 'd', 0, cb);
		client.put('k', 'd', 0, cb);
		client.put('k', 'd', 0, cb);

		assert.strictEqual(errors, 2);


		assert.strictEqual(fsMock.invocations.length, 4);
		assert.strictEqual(fsMock.invocations[2].method, 'writeFile');
		assert.strictEqual(fsMock.invocations[3].method, 'writeFile');
	});
});
