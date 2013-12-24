var PolyMock = require('polymock');

module.exports.FILECONTENT = '123';

module.exports.create = function(exists) {
	var mock = PolyMock.create();

	mock.createMethod('writeFile');
	mock.createMethod('readFile', undefined, { callbackArgs: [ null, module.exports.FILECONTENT] });
	mock.createMethod('exists', undefined, { callbackArgs: exists });
	mock.createMethod('mkdir');
	return mock;
};

