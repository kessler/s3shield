module.exports = function(retries) {
	return Math.floor( Math.log(retries) / Math.log(2) ) + 1;
}