var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  console.log('*********** Deploying Migrations');
  deployer.deploy(Migrations, {from: accounts[1]});
};
