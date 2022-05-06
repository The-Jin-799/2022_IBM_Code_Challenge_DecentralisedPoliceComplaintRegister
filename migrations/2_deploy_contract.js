var PoliceComplaint = artifacts.require("./PoliceComplaint.sol");

module.exports = function (deployer) {
  deployer.deploy(PoliceComplaint);
};
