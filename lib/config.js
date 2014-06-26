/*************************************************************************************************
	DO NOT MODIFY THIS FILE UNLESS YOU REALLY REALLY REALLY REALLY KNOW WHAT YOU ARE DOING!!!  /k
*************************************************************************************************/
var path = require('path');
var rc = require('rc');

var defaults = {

	faulty: {
		failures: 3
	},

	aws: {
		region: 'us-standard',
		accessKeyId: undefined,
		secretAccessKey: undefined
	},

	/*
		see lru-cache for all the options
	*/
	lru: {
		max: 100,
		maxAge: 1000 * 60 * 60 * 24 // one day
	},

	gzip: {
		enabled: false,
		options: undefined
	},

	deleteAfterUpload: false,

	/*
		in put() functions where a string or an object is provided (and not a buffer) this enconding will be used when turning the data into a buffer
	*/
	uploadEncoding: undefined
};

module.exports = rc('s3shield', defaults);
