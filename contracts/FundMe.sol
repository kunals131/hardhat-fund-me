
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";
error FundMe__Noti_Owner();

//Interfaces, Libraries, 

/**
@title A contract for crowd funding
@author Kunal Sangtiani
@notice This contract is  to demo a sample crowd funding!
@dev This implements s_priceFeeds as our library

 */

contract FundMe {
    //library
    //Type declarations
    using PriceConverter for uint256;

    uint public minimumUsd = 50*1e18;

    address[] private s_funders;
    mapping(address=>uint256) private s_addressToAmountFunded;

    address private i_owner;
    AggregatorV3Interface private s_priceFeed;
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress); 
    }

    function fund() public payable{
        //Want to be able to set a minimum fund  
        //1. How do we send ETH to this contract?
        require(msg.value.getConversionRate(s_priceFeed)>=minimumUsd, "Didn't send enough!"); /// = 1*10**18
        //How do we convert usd to eth , we cannot make any API request! 
       //msg.value has 18 decimal places
       s_funders.push(msg.sender);
       s_addressToAmountFunded[msg.sender] = msg.value;
    }


    function withdraw() public onlyOwner{
        //Check if the caller is the i_owner as i_owner can only withdraw the money
        // require(msg.sender == i_owner, "Sender is not i_owner");
        //for loop //[1,2,3,4] works same as other languages
        /*starting index, ending index, step amount*/
        console.log('Withdraw called by  : ', msg.sender);
        console.log('Balance withdrawn  : ', address(this).balance);
    

        for(uint256 funderIndex = 0; funderIndex>s_funders.length; funderIndex++) {
            //code
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        //reset the array
        s_funders = new address[](0);
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

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 funderIndex=0; funderIndex<funders.length; ++funderIndex) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
         (bool callSuccess,) = payable(i_owner).call{value : address(this).balance}("");
        require(callSuccess, "Call Failed");

    }

    function getOwner() view public returns(address) {
        return i_owner;
    }

    function getFunder(uint256 index) view public returns(address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) view public returns(uint256) {
        return s_addressToAmountFunded[funder];
    } 

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return s_priceFeed;
    }

    modifier onlyOwner {
        if (msg.sender!=i_owner) revert FundMe__Noti_Owner();
        _;
    }
}