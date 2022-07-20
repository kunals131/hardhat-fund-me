
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();

//Interfaces, Libraries, 

/**
@title A contract for crowd funding
@author Kunal Sangtiani
@notice This contract is  to demo a sample crowd funding!
@dev This implements priceFeeds as our library

 */

contract FundMe {
    //library
    //Type declarations
    using PriceConverter for uint256;

    uint public minimumUsd = 50*1e18;

    address[] public funders;
    mapping(address=>uint256) public addressToAmountFunded;

    address public owner;
    AggregatorV3Interface public priceFeed;
    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress); 
    }

    function fund() public payable{
        //Want to be able to set a minimum fund  
        //1. How do we send ETH to this contract?
        require(msg.value.getConversionRate(priceFeed)>=minimumUsd, "Didn't send enough!"); /// = 1*10**18
        //How do we convert usd to eth , we cannot make any API request! 
       //msg.value has 18 decimal places
       funders.push(msg.sender);
       addressToAmountFunded[msg.sender] = msg.value;
    }


    function withdraw() public onlyOwner{
        //Check if the caller is the owner as owner can only withdraw the money
        // require(msg.sender == owner, "Sender is not owner");
        //for loop //[1,2,3,4] works same as other languages
        /*starting index, ending index, step amount*/


        for(uint256 funderIndex = 0; funderIndex>funders.length; funderIndex++) {
            //code
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        //reset the array
        funders = new address[](0);
        //actually withdraw the funds


        /*There are three ways to tranfer or withdraw funds in

        transfer
        payable(msg.sender).transfer(address(this).balance);

        How it works : 
        1. Reverts the transaction if gas fee increases 2300 and throws error
--------------------------------------------------------------------------------

        send
        bool sendSuccess = payable(msg.sender).send(address(this).balance);

        How it works : 
        1. Doesnt error or revert, it returns a boolean true or false wether the transaction went through or not
        2. Also capped at 2300 gas

---------------------------------------------------------------------
        call
        (bool callSuccess,)=payable(msg.sender).call{value : address(this.balance)}("")
        require(callSuccess, "call failed");

----------------------------------------------------------------------------------------\
Out of above three call is the most reccomended way
        */ 

        (bool callSuccess,) = payable(msg.sender).call{value : address(this).balance}("");
        require(callSuccess, "Call Failed");


    }

    modifier onlyOwner {
        if (msg.sender!=owner) revert FundMe__NotOwner();
        _;
    }
}