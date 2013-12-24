var PolyMock = require('polymock');

module.exports.FILECONTENT = '123';

module.exports.create = function() {
	var mock = PolyMock.create();

	mock.createMethod('writeFile');
	mock.createMethod('readFile', undefined, { callbackArgs: [ null, module.exports.FILECONTENT] });

	return mock;
};

