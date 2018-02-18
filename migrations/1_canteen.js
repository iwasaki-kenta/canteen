var Canteen = artifacts.require("./Canteen.sol");

module.exports = function(deployer, network, accounts) {
  console.log(accounts)
  deployer.deploy(Canteen);
};
