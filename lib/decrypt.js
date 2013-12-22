var crypto = require('crypto');
var config = require('./config.js');
module.exports = function decrypt(encryptedData) {

	if (config.password) {
		var decipher = crypto.createDecipher('aes128', config.password);

		var u = decipher.update(encryptedData, 'base64', 'utf8');

		return u + decipher.final('utf8');
	} else {
		return encryptedData;
	}
}