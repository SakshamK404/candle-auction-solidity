# Candle Auction Smart Contract

This project implements a Solidity smart contract for a candle auction using Truffle and OpenZeppelin libraries. A candle auction is a variation of the English auction, where the auction ends at a random time determined by the end of a burning candle.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Deployment](#deployment)
- [Running Tests](#running-tests)
- [Test Cases](#test-cases)

## Overview

The Candle Auction smart contract allows participants to place bids during the auction period. The highest bidder at the end of the auction wins and can withdraw the highest bid amount, while other participants can withdraw their bids if they were outbid.

## Project Structure
CandleAuction/
├── contracts/
│ ├── CandleAuction.sol
│ └── Migrations.sol
├── migrations/
│ ├── 1_initial_migration.js
│ └── 2_deploy_contracts.js
├── test/
│ └── testCandleAuction.js
├── truffle-config.js
├── package.json
└── README.md


## Setup and Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/yourusername/CandleAuction.git
    cd CandleAuction
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Install Truffle globally if not already installed:**

    ```sh
    npm install -g truffle
    ```

4. **Install Ganache CLI globally if not already installed:**

    ```sh
    npm install -g ganache-cli
    ```

## Deployment

1. **Start Ganache CLI:**

    ```sh
    ganache-cli
    ```

2. **Compile the contracts:**

    ```sh
    truffle compile
    ```

3. **Migrate the contracts:**

    ```sh
    truffle migrate
    ```

## Running Tests

To run the tests, ensure Ganache CLI is running and use the following command:

```sh
truffle test

