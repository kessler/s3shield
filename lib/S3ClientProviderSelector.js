var KnoxS3ClientProvider = require('./KnoxS3ClientProvider.js');
var FaultyS3ClientProvider = require('./FaultyS3Client.js').Provider;
var AwsS3ClientProvider = require('./AwsS3ClientProvider.js');
var LocalFSClientProvider = require('./LocalFSClient.js').Provider;

module.exports.get = function(clientType) {
	if (clientType === undefined || clientType === null || clientType === 'knox') {
		return KnoxS3ClientProvider;

	// } else if (clientType === 'aws-sdk') {
	// 	return AwsS3ClientProvider;

	} else  if (clientType === 'faulty') {
		return FaultyS3ClientProvider;

	} else  if (clientType === 'local') {
		return LocalFSClientProvider;

	} else {
		throw new Error('unsupported client type ' + clientType);
	}
};