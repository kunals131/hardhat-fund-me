
const { assert, expect } = require('chai');
const {deployments, ethers, getNamedAccounts} = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)?
describe.skip:
describe("FundMe", async function() {
    let fundMe;
    let deployer
    let mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1") //converts 1 to 18 zeros
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
            const response = await fundMe.getPriceFeed();
            assert.equal(mockV3Aggregator.address, response)
        })
    })

    describe("fund", async function() {
        it("Fails if you dont send enough ETH", async function() {
            await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!");

        })

        it("updates the ammount funded data structure", async function() {
            await fundMe.fund({value : sendValue});
            //get function for public
            const response = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        })

        it("Adds funder to array of getFunder", async function() {
            await fundMe.fund({value : sendValue});
            const funder = await fundMe.getFunder(0);
            assert.equal(funder,deployer);
        })
    });

    describe("withdraw", async function() {
       beforeEach(async function() {
        await fundMe.fund({value : sendValue});
       })
       
       it("withdraw ETH from a single founder", async function() {
        //Arrange
        //You can also use ethers.provider.getBalance we just need a provider because it comes with get Balance function
        const startingFundMeBalance = await ethers.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);
        //Act
        const transactionResponse = await fundMe.withdraw();
        const transactionReciept = await transactionResponse.wait(1);

        const {gasUsed,effectiveGasPrice} = transactionReciept;
        const gasCost = gasUsed.mul(effectiveGasPrice);

        const endingFundmeBalance=  await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
        //Assert
        assert.equal(endingFundmeBalance,0);
        assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),endingDeployerBalance.add(gasCost).toString());
       });

       it("allow us to withdraw with multiple getFunder", async function() {
        //Arrange
        const accounts = await ethers.getSigners();
        for(let i=1; i<6; ++i) {
            const fundMeConnectedContract = await fundMe.connect(
                accounts[i]
            )
            await fundMeConnectedContract.fund({value : sendValue});
        }

        const startingFundMeBalance = await ethers.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);
        //Act

        const transactionResponse = await fundMe.withdraw();
        const transactionReciept = await transactionResponse.wait(1);

        const {gasUsed,effectiveGasPrice} = transactionReciept;
        const gasCost = gasUsed.mul(effectiveGasPrice);


        const endingFundmeBalance=  await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
        //Assert
        assert.equal(endingFundmeBalance,0);
        assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),endingDeployerBalance.add(gasCost).toString());

        //Funder are reset properly
        await expect(fundMe.getFunder(0)).to.be.reverted

        // for(i=1; i<6; ++i) {
        //     assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
        // }
       })


       it("only allows owner to withdraw", async function() {
        const accounts = await ethers.getSigners();
        const attacker = accounts[1];
        //connects account not just address so we require whole object instead of just address
        const attackerConnectedContract = await fundMe.connect(attacker);
        await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");
       })
    })
}) 
