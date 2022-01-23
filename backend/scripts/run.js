const main = async () => {
    const contractFactory = await hre.ethers.getContractFactory('MyEpicNFT');
    const contract = await contractFactory.deploy();

    await contract.deployed();
    
    console.log('Contract deployed to ', contract.address)

    // testing if nft mint limit works
    // for (i=0; i < 6; i++) {
    //     let txn = await contract.makeAnEpicNFT("satoshi"); 

    //     console.log("Mining...")
    //     await txn.wait();
    
    //     console.log("Successfully mintend NFT #", i);
    // }
    
    // console.log(await contract.mintedSoFar());    

    let txn = await contract.makeAnEpicNFT("satoshi"); 

    console.log("Mining...")
    let receipt = await txn.wait();

    console.log(receipt.events[1].args.tokenId.toNumber()) 
    
}

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
