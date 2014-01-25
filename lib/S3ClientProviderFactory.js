var S3ClientProviderSelector = require('./S3ClientProviderSelector.js');

module.exports.newInstance = function(clientType, options) {

	var providerClass = S3ClientProviderSelector.get(options);

	return new providerClass(options);
};

