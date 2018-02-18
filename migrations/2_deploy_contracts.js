var Canteen = artifacts.require("Canteen")

module.exports = function(deployer, accounts) {
	return deployer.deploy(Canteen);
}
