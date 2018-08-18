var OverdraftToken = artifacts.require("OverdraftToken");

module.exports = function(deployer) {
  const args = process.argv.slice()
  if (args.length < 4) {
    console.log('*********** Deploying OverdraftToken with default account');
    deployer.deploy(OverdraftToken);
  } else {
    console.log(`*********** Deploying OverdraftToken with custom account: ${args[3]}`);
    deployer.deploy(OverdraftToken, {from: args[3]});
  }
};