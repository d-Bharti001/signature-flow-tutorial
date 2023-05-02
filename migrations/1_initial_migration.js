const ECDSA = artifacts.require("ECDSA");
const SigFlow = artifacts.require("SigFlow");

module.exports = async function(deployer) {
  await deployer.deploy(ECDSA);
  await deployer.link(ECDSA, SigFlow);
  await deployer.deploy(SigFlow, "SigFlowContract", "1.0");
};
