var S3ClientProviderFactory = require('../lib/S3ClientProviderFactory.js')
var KnoxS3ClientProvider = require('../lib/KnoxS3ClientProvider.js')
var KnoxS3Client = require('../lib/KnoxS3Client')

var AwsS3ClientProvider = require('../lib/AwsS3ClientProvider.js')
var AwsS3Client = require('../lib/AwsS3Client')

var assert = require('assert')

var options = {
	aws: {
		accessKeyId: '1',
		secretAccessKey: '2',
		bucket: '3'
	}
}


describe('S3ClientProviderFactory', function () {

	it('creates a knox client provider', function () {
		var provider = S3ClientProviderFactory.newInstance('knox', options)

		assert.ok(provider instanceof KnoxS3ClientProvider)

		var client = provider.get('moo')

		assert.ok(client instanceof KnoxS3Client)
	})


	it('creates an aws-sdk client provider', function () {
		var provider = S3ClientProviderFactory.newInstance('aws-sdk', options)

		assert.ok(provider instanceof AwsS3ClientProvider)

		var client = provider.get('moo')

		assert.ok(client instanceof AwsS3Client)
	})
})
