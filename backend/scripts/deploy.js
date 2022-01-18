const main = async () => {
    const contractFactory = await hre.ethers.getContractFactory('MyEpicNFT')
    const contract = await contractFactory.deploy()

    await contract.deployed();
    
    console.log('Contract deployed to ', contract.address)

    let txn = await contract.makeAnEpicNFT("sudham"); 
    await txn.wait();
    console.log("Minted the genesis NFT for you :)")
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1)
    }
};

runMain();