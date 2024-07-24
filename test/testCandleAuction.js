const { time, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const CandleAuction = artifacts.require("CandleAuction");

contract("CandleAuction", (accounts) => {
  let auction;
  const biddingTime = 10;
  const minIncrement = web3.utils.toWei("0.1", "ether");

  beforeEach(async () => {
    auction = await CandleAuction.new(biddingTime, minIncrement);
  });

  it("should start an auction and set the owner", async () => {
    const owner = await auction.owner();
    assert.equal(owner, accounts[0], "Owner should be the deployer");
  });

  it("should accept higher bids and record the highest bidder", async () => {
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    let highestBid = await auction.highestBid();
    assert.equal(highestBid, web3.utils.toWei("1", "ether"), "Highest bid should be 1 ether");

    await auction.bid({ from: accounts[2], value: web3.utils.toWei("1.2", "ether") });
    highestBid = await auction.highestBid();
    assert.equal(highestBid, web3.utils.toWei("1.2", "ether"), "Highest bid should be 1.2 ether");
  });

  it("should reject bids lower than the minimum increment", async () => {
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    await expectRevert(
      auction.bid({ from: accounts[3], value: web3.utils.toWei("1.05", "ether") }),
      "Bid increment too low"
    );
  });

  it("should allow withdrawals", async () => {
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    await auction.bid({ from: accounts[2], value: web3.utils.toWei("1.2", "ether") });

    const initialBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
    const receipt = await auction.withdraw({ from: accounts[1] });

    expectEvent(receipt, 'Withdrawal', {
      bidder: accounts[1],
      amount: web3.utils.toWei("1", "ether")
    });

    const finalBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
    const balanceDiff = finalBalance.sub(initialBalance);
    assert(balanceDiff.gte(web3.utils.toBN(web3.utils.toWei("0.99", "ether"))), "Balance should be refunded considering gas costs");
  });

  it("should allow the highest bidder to be the winner", async () => {
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    await auction.bid({ from: accounts[2], value: web3.utils.toWei("1.2", "ether") });

    const currentBlock = await web3.eth.getBlockNumber();
    const endBlock = currentBlock + biddingTime;

    for (let i = currentBlock; i < endBlock; i++) {
      await time.advanceBlock();
    }

    const receipt = await auction.endAuction({ from: accounts[0] });
    expectEvent(receipt, 'AuctionEnded', {
      winner: accounts[2],
      amount: web3.utils.toWei("1.2", "ether")
    });

    const ended = await auction.ended();
    assert.equal(ended, true, "Auction should be ended");

    await expectRevert(
      auction.bid({ from: accounts[3], value: web3.utils.toWei("1.3", "ether") }),
      "Auction has ended or canceled"
    );
  });

  it("should allow the owner to cancel the auction", async () => {
    const receipt = await auction.cancelAuction({ from: accounts[0] });
    expectEvent(receipt, 'AuctionCanceled');

    const canceled = await auction.canceled();
    assert.equal(canceled, true, "Auction should be canceled");

    await expectRevert(
      auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") }),
      "Auction has ended or canceled"
    );
  });

  it("should not allow bidding after the auction is ended", async () => {
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    const currentBlock = await web3.eth.getBlockNumber();
    const endBlock = currentBlock + biddingTime;

    for (let i = currentBlock; i < endBlock; i++) {
      await time.advanceBlock();
    }

    await auction.endAuction({ from: accounts[0] });

    await expectRevert(
      auction.bid({ from: accounts[3], value: web3.utils.toWei("1.3", "ether") }),
      "Auction has ended or canceled"
    );
  });

  it("should not allow owner to end auction before time", async () => {
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });

    await expectRevert(
      auction.endAuction({ from: accounts[0] }),
      "Auction not yet ended"
    );
  });

  it("should handle multiple withdrawals correctly", async () => {
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    await auction.bid({ from: accounts[2], value: web3.utils.toWei("1.2", "ether") });

    const initialBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
    await auction.withdraw({ from: accounts[1] });

    await expectRevert(
      auction.withdraw({ from: accounts[1] }),
      "No funds to withdraw"
    );

    const finalBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
    const balanceDiff = finalBalance.sub(initialBalance);
    assert(balanceDiff.gte(web3.utils.toBN(web3.utils.toWei("0.99", "ether"))), "Balance should be refunded considering gas costs");
  });

  it("should prevent reentrancy attacks on withdraw", async () => {
    
    await auction.bid({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    await auction.bid({ from: accounts[2], value: web3.utils.toWei("1.2", "ether") });

    await auction.withdraw({ from: accounts[1] });

    await expectRevert(
      auction.withdraw({ from: accounts[1] }),
      "No funds to withdraw"
    );
  });
});
