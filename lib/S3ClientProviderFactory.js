var S3ClientProviderSelector = require('./S3ClientProviderSelector.js');

module.exports.newInstance = function(clientType, options) {

	var providerClass = S3ClientProviderSelector.get(clientType);

	return new providerClass(options);
};

