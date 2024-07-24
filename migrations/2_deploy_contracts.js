const CandleAuction = artifacts.require("CandleAuction");

module.exports = function (deployer) {
  const biddingTime = 10; 
  const minIncrement = web3.utils.toWei("0.1", "ether"); 

  deployer.deploy(CandleAuction, biddingTime, minIncrement);
};
