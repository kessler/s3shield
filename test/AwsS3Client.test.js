
var _ = require('lodash');
var assert = require('assert');
var async = require('async');
var aws = require('aws-sdk');

var conf = require('../lib/config.js');

var AwsS3Client = require('../lib/AwsS3Client.js');

//

function AwsS3ClientIntegrationTest() {
	this._testData = new Buffer('testData' + Date.now());
	this._client = null;
	this._fetchedData = null;
	this._awsClient = null;
};

var p = AwsS3ClientIntegrationTest.prototype;

p.start = function(callback) {
	async.series([
		_.bind(this._createAwsClient, this),
		//_.bind(this._clean, this),
		_.bind(this._createClient, this),
		_.bind(this._put, this),
		_.bind(this._fetch, this),
		_.bind(this._check, this),
	], callback);
};

p._createClient = function(callback) {
	//console.log('_createClient');
	var options = _.clone(conf.aws);
	options.region = null;
	options.bucket = 'rtb-redshift';
	this._client = new AwsS3Client(options);
	callback(null);
};

p._put = function(callback) {
	//console.log('_put');
	this._client.put('test/awsS3Client.txt', this._testData, callback);
};

p._createAwsClient = function(callback) {
	//console.log('_createAwsClient');
	var options = _.clone(conf.aws);
	options.region = null;
	options.bucket = 'rtb-redshift';
	this._awsClient = new aws.S3(options);
	callback(null);
};

p._fetch = function(callback) {
	//console.log('_fetch');
	var options = {
		Bucket: 'rtb-redshift',
		Key: 'test/awsS3Client.txt'
	};
	var onObjectGot = _.bind(this._onObjectGot, this, callback);
	var request = this._awsClient.getObject(options, onObjectGot);
	request.send();
};

p._onObjectGot = function(callback, err, data) {
	//console.log('_onObjectGot');
	if (err) {
		callback(err);
		return;
	}
	this._fetchedData = data.Body;
	callback(null);
};

p._check = function(callback) {
	//console.log('_check');
	assert.strictEqual(this._fetchedData.toString(), this._testData.toString());
	callback(null);
};

p._clean = function(callback) {
	//console.log('_clean');
	var options = {
		Bucket: 'rtb-redshift',
		Key: 'test/awsS3Client.txt'
	};
	var request = this._awsClient.deleteObject(options, callback);
	request.send();
};

delete p;

//

describe('AwsS3Client', function() {

	it('constructs', function() {

		var awsOptions = {
			accessKeyId: 'testAccessKeyId',
			secretAccessKey: 'testSecretAccessKey',
			bucket: 'testBucket',
			region: 'testRegion',
			endpoint: 'testEndpoint'
		};

		var awsS3Client = new AwsS3Client(awsOptions);

		assert(_.isObject(awsS3Client._fs));

	});

	it('put', function() {

		var testData = new Buffer('testData');

		var mockRequestOnCallCount = 0;
		var mockRequestSendCallCount = 0;
		var mockClientPutObjectCallCount = 0;
		var mockOnSuccessCallCount = 0;

		var mockRequest = {

			on: function(type, callback) {
				if (mockRequestOnCallCount === 0) {
					assert.strictEqual(type, 'error');
					assert.strictEqual(callback, 'testCallback');
				}
				if (mockRequestOnCallCount === 1) {
					assert.strictEqual(type, 'success');
					callback('testResponse');
				}
				mockRequestOnCallCount++;
			},

			send: function() {
				assert.strictEqual(mockRequestOnCallCount, 2);
				mockRequestSendCallCount++;
			}

		};

		var mock = {

			_bucket: 'testBucket',

			_onSuccess: function(callback) {
				assert.strictEqual(callback, 'testCallback');
				mockOnSuccessCallCount++;
			},

			_client: {

				putObject: function(putObjectOptions) {
					assert.strictEqual(putObjectOptions.Bucket, 'testBucket');
					assert.strictEqual(putObjectOptions.Body, testData);
					mockClientPutObjectCallCount++;
					return mockRequest;
				}

			}

		};

		AwsS3Client.prototype.put.call(mock, 'testKey', testData, 'testCallback');

		assert.strictEqual(mockRequestOnCallCount, 2);
		assert.strictEqual(mockRequestSendCallCount, 1);
		assert.strictEqual(mockClientPutObjectCallCount, 1);
		assert.strictEqual(mockOnSuccessCallCount, 1);
	});

	it('putFile', function() {

		var mockFsReadFileCallCount = 0;
		var mockOnFileReadCallCount = 0;

		var mock = {

			_fs: {

				readFile: function(file, callback) {
					assert.strictEqual(file, 'testFile');
					callback('testError', 'testData');
					mockFsReadFileCallCount++;
				}

			},

			_onFileRead: function(key, callback, err, data) {
				assert.strictEqual(key, 'testKey');
				assert.strictEqual(callback, 'testCallback');
				assert.strictEqual(err, 'testError');
				assert.strictEqual(data, 'testData');
				mockOnFileReadCallCount++;
			}

		};

		AwsS3Client.prototype.putFile.call(mock, 'testKey', 'testFile', 'testCallback');

		assert.strictEqual(mockFsReadFileCallCount, 1);
		assert.strictEqual(mockOnFileReadCallCount, 1);

	});

	it('It all works together', function(callback) {
		this.timeout(50000);
		var awsS3ClientIntegrationTest = new AwsS3ClientIntegrationTest();
		awsS3ClientIntegrationTest.start(callback);
	});

});
