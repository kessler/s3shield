var chai = require('chai');

var assert = chai.assert;

var Stubborn = require('stubborn');

var logarithmicProgression = require('../lib/logarithmicProgression.js');
var AbstractS3Client = require('../lib/AbstractS3Client.js');

describe('AbstractS3Client', function() {

	it('constructs', function() {

		var client = new AbstractS3Client();

		assert.strictEqual(client._Stubborn, Stubborn);
		assert.strictEqual(client._progression, logarithmicProgression);

	});

	it('put', function() {

		var mockGenericPutCallCount = 0;
		var mockPutCallCount = 0;

		var mock = {

			_genericPut: function(task, maxAttempts, callback) {
				assert.strictEqual(maxAttempts, 'testMaxAttempts');
				assert.strictEqual(callback, 'testCallback');
				task('testCallback2');
				mockGenericPutCallCount++;
			},

			_put: function(key, data, callback) {
				assert.strictEqual(key, 'testKey');
				assert.strictEqual(data, 'testData');
				assert.strictEqual(callback, 'testCallback2');
				mockPutCallCount++;
			}

		};

		AbstractS3Client.prototype.put.call(mock, 'testKey', 'testData', 'testMaxAttempts', 'testCallback');

		assert.strictEqual(mockGenericPutCallCount, 1);
		assert.strictEqual(mockPutCallCount, 1);

	});

	it('putFile', function() {

		var mockGenericPutCallCount = 0;
		var mockPutFileCallCount = 0;

		var mock = {

			_genericPut: function(task, maxAttempts, callback) {
				assert.strictEqual(maxAttempts, 'testMaxAttempts');
				assert.strictEqual(callback, 'testCallback');
				task('testCallback2');
				mockGenericPutCallCount++;
			},

			_putFile: function(key, file, callback) {
				assert.strictEqual(key, 'testKey');
				assert.strictEqual(file, 'testFile');
				assert.strictEqual(callback, 'testCallback2');
				mockPutFileCallCount++;
			}

		};

		AbstractS3Client.prototype.putFile.call(mock, 'testKey', 'testFile', 'testMaxAttempts', 'testCallback');

		assert.strictEqual(mockGenericPutCallCount, 1);
		assert.strictEqual(mockPutFileCallCount, 1);

	});

	it('_genericPut', function() {

		var mockStubbornCallCount = 0;
		var mockStubbornRunCallCount = 0;

		var mock = {

			_progression: 'testProgression',

			_Stubborn: function(task, options, callback) {

				assert.instanceOf(this, mock._Stubborn);
				assert.strictEqual(task, 'testTask');
				assert.deepEqual(options, { maxAttempts: 'testMaxAttempts', delayProgression: 'testProgression' });
				assert.strictEqual(callback, 'testCallback');

				this.run = function() {
					mockStubbornRunCallCount++;
				};

				mockStubbornCallCount++;
			}

		};

		AbstractS3Client.prototype._genericPut.call(mock, 'testTask', 'testMaxAttempts', 'testCallback');

		assert.strictEqual(mockStubbornCallCount, 1);
		assert.strictEqual(mockStubbornRunCallCount, 1);

	});

});