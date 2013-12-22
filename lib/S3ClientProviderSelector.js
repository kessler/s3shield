var KnoxS3ClientProvider = require('./KnoxS3ClientProvider.js');
var FaultyS3ClientProvider = require('./FaultyS3Client.js').Provider;

module.exports.get = function(clientType) {
	if (clientType === undefined || clientType === null || clientType === 'knox') {
		return KnoxS3ClientProvider;
	} else  if (clientType === 'faulty') {
		return FaultyS3ClientProvider;
	} else {
		throw new Error('unsupported client type ' + clientType);
	}
};