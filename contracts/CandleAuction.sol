
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CandleAuction is ReentrancyGuard {
    address public owner;
    uint public endBlock;
    uint public highestBid;
    address public highestBidder;
    mapping(address => uint) public bids;
    bool public ended;
    bool public canceled;
    uint public minIncrement;

    event AuctionStarted(uint endBlock);
    event NewBid(address indexed bidder, uint amount);
    event AuctionEnded(address winner, uint amount);
    event AuctionCanceled();
    event Withdrawal(address indexed bidder, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier auctionOngoing() {
        require(block.number <= endBlock && !ended && !canceled, "Auction has ended or canceled");
        _;
    }

    constructor(uint _biddingTime, uint _minIncrement) {
        owner = msg.sender;
        endBlock = block.number + _biddingTime;
        minIncrement = _minIncrement;
        emit AuctionStarted(endBlock);
    }

    function bid() external payable auctionOngoing nonReentrant {
        require(msg.value >= highestBid + minIncrement, "Bid increment too low");

        if (highestBid != 0) {
            bids[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit NewBid(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint amount = bids[msg.sender];
        require(amount > 0, "No funds to withdraw");

        bids[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    function endAuction() external onlyOwner nonReentrant {
        require(block.number >= endBlock, "Auction not yet ended");
        require(!ended, "Auction already ended");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        (bool success, ) = owner.call{value: highestBid}("");
        require(success, "Transfer to owner failed");
    }

    function cancelAuction() external onlyOwner auctionOngoing nonReentrant {
        canceled = true;
        emit AuctionCanceled();
    }
}
