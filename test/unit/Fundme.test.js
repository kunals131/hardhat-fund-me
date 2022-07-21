
const { assert } = require('chai');
const {deployments, ethers, getNamedAccounts} = require('hardhat');

describe("FundMe", async function() {
    let fundMe;
    let deployer
    let mockV3Aggregator;
    beforeEach(async function() {
        //deploy fundme using hardhat deploy
        // const accounts = await ethers.getSigner();
        // const accountZero = await accounts[0];
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    })
    describe("constructor", async function() {
        it("sets the aggregator address correctly", async function() {
            const response = await fundMe.priceFeed();
            assert.equal(mockV3Aggregator.address, response)
        })
    })
}) 