var SongContract = artifacts.require("./SongContract.sol");

module.exports = function (deployer) {
  deployer.deploy(SongContract);
};

/*
var SimpleStorage = artifacts.require("./SimpleStorage.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
};

*/
