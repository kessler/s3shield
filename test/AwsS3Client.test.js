
var _ = require('lodash');
var assert = require('assert');
var async = require('async');
var aws = require('aws-sdk');
var zlib = require('zlib');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var conf = require('../lib/config.js');

var StreamToBuffer = require('../lib/StreamToBuffer.js');
var AwsS3Client = require('../lib/AwsS3Client.js');

//

function AwsS3ClientIntegrationTest(withGzip) {
	this._testData = new Buffer('testData' + Date.now());
	this._client = null;
	this._fetchedData = null;
	this._awsClient = null;
	this._withGzip = withGzip;
};

var p = AwsS3ClientIntegrationTest.prototype;

p.start = function(callback) {
	async.series([
		_.bind(this._createAwsClient, this),
		//_.bind(this._clean, this),
		_.bind(this._createClient, this),
		_.bind(this._put, this),
		_.bind(this._wait, this, 200),
		_.bind(this._fetch, this),
		_.bind(this._check, this),
	], callback);
};

p._createClient = function(callback) {
	console.log('_createClient');
	var options = _.clone(conf.aws);
	options.region = null;
	options.bucket = 'rtb-redshift';
	this._client = new AwsS3Client(options, { enabled: this._withGzip });
	callback(null);
};

p._put = function(callback) {
	console.log('_put');
	this._client.put('test/awsS3Client.txt', this._testData, callback);
};

p._createAwsClient = function(callback) {
	console.log('_createAwsClient');
	var options = _.clone(conf.aws);
	options.region = null;
	options.bucket = 'rtb-redshift';
	this._awsClient = new aws.S3(options);
	callback(null);
};

p._fetch = function(callback) {
	console.log('_fetch');
	var key = 'test/awsS3Client.txt';
	if (this._withGzip) {
		key += '.gz';
	}
	var options = {
		Bucket: 'rtb-redshift',
		Key: key
	};
	var request = this._awsClient.getObject(options);
	var onSucess = _.bind(this._onSucess, this, callback);
	request.on('success', onSucess);
	request.on('error', callback);
	request.send();
};

p._onSucess = function(callback, res) {
	console.log('_onSucess');
	this._fetchedData = res.data.Body;
	callback(null);
};

p._onObjectGot = function(callback, err, data) {
	console.log('_onObjectGot', err, data);
	if (err) {
		callback(err);
		return;
	}
	this._fetchedData = data.Body;
	callback(null);
};

p._check = function(callback) {
	console.log('_check');
	var fetchedData = this._fetchedData;
	console.log(fetchedData);
	if (this._withGzip) {
		var gunzip = zlib.createGunzip();
		var onGunzipped = _.bind(this._onGunzipped, this, callback);
		var streamToBuffer = new StreamToBuffer(gunzip, onGunzipped);
		streamToBuffer.start();
		gunzip.end(fetchedData);
	} else {
		assert.strictEqual(fetchedData.toString(), this._testData.toString());
		callback(null);
	}
};

p._onGunzipped = function(callback, err, buffer) {
	console.log('_onGunzipped');
	assert.strictEqual(buffer.toString(), this._testData.toString());
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

p._wait = function(time, callback) {
	console.log('_wait');
	setTimeout(callback, time);
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

	it('put without gzip', function() {

		var testData = new Buffer('testData');

		var mockRequestCallCount = 0;

		var mock = {

			_bucket: 'testBucket',

			_gzipOptions: {
				enabled: false
			},

			_request: function(putObjectOptions, key, data, callback) {
				var body = putObjectOptions.Body;
				assert.strictEqual(body.toString(), testData.toString());
				delete putObjectOptions.Body;
				assert.deepEqual(putObjectOptions, {
					Bucket: 'testBucket',
					Key: 'testKey'
				});
				assert.strictEqual(key, 'testKey');
				assert.strictEqual(testData, data);
				assert.strictEqual(callback, 'testCallback');
				mockRequestCallCount++;
			}

		};

		AwsS3Client.prototype.put.call(mock, 'testKey', testData, 'testCallback');

		assert.strictEqual(mockRequestCallCount, 1);

	});

	it('_request', function() {

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
					callback();
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
					assert.strictEqual(putObjectOptions, 'testPutObjectOptions');
					mockClientPutObjectCallCount++;
					return mockRequest;
				}

			}

		};

		AwsS3Client.prototype._request.call(mock, 'testPutObjectOptions', 'testKey', 'testSata', 'testCallback');

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

	it('It all works together without gzip', function(callback) {
		this.timeout(10000);
		var awsS3ClientIntegrationTest = new AwsS3ClientIntegrationTest(false);
		awsS3ClientIntegrationTest.start(callback);
	});

	it('It all works together gzip', function(callback) {
		this.timeout(10000);
		var awsS3ClientIntegrationTest = new AwsS3ClientIntegrationTest(true);
		awsS3ClientIntegrationTest.start(callback);
	});

});
