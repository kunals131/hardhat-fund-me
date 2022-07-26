const { getNamedAccounts, ethers } = require("hardhat");


async function main() {
    const {deployer} = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);

    console.log('Funding Contract...');
    const transactionResponse = await fundMe.fund({value : ethers.utils.parseEther("1")})
    await transactionResponse.wait(1);
    console.log('FUNDED!');

}

main().then(()=>process.exit(0)).catch((err)=>{
    console.log(err);
    process.exit(1);
})

