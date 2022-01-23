import toast, { Toaster } from "react-hot-toast"
import React, { useEffect, useState } from "react"
import myEpicNFT from "./utils/MyEpicNFT.json"
import { ethers } from "ethers"
import "./App.css"

const { ethereum } = window

const contractAddress = "0xF87f890C5257a0E879CC483184B7F85e3404a8C1"; // rinkeby contract

function App() {
	const [currentAccount, setCurrentAccount] = useState("")
	const [transactionId, setTransactionId] = useState("")
	const [name, setName] = useState("anon")
	const [tokenId, setTokenId] = useState("")
	const [minted, setMinted] = useState(0)

	const connectToContract = async () => {

		const provider = new ethers.providers.Web3Provider(ethereum)
		const signer = provider.getSigner()
		const nftContract = new ethers.Contract( contractAddress, myEpicNFT.abi, signer )

		return nftContract

	}
	
	const updateMintedSoFar = async () => {
		
		const nftContract = await connectToContract()
		const mintedSoFar = await nftContract.mintedSoFar()

		setMinted(mintedSoFar.toNumber())
	}

	const checkIfAccountIsConnected = async () => {

		const toastId = toast.loading("Checking for connected wallet...");

		if (!ethereum) {

			toast.error("Make sure you have metamask", { id: toastId });
			return

		} else {

			const accounts = await ethereum.request({ method: "eth_accounts" });

			if (accounts.length === 0) {
				
				toast.error("No account connected", { id: toastId })

			} else {

				const account = accounts[0]
				setCurrentAccount(account)
				
				toast.success("Connected with " + account, { id: toastId })

				setupEventListener()
				updateMintedSoFar()
			}
		}
	}

	const checkAndSwitchChain = async () => {

		const chainId = await ethereum.request({ method: "eth_chainId" })

		// rinkeby's chain id is 0x4
		if (chainId !== "0x4") { 

			const chainToast = toast.loading("Please connect to rinkeby...")

			await ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x4" }]
			}).then(() => {
			
				toast.success("Successfully connected to rinkeby!", { id: chainToast })
				return "success"

			}).catch((error) => {

				toast.error("Failed to connect to rinkeby!", { id: chainToast })
				console.error(error)

				return "failed"

			})

		}

		return "already connected"
	}

	const setupEventListener = async () => {

		try {

			const res = checkAndSwitchChain()

			if (res === "failed") {
				console.log("Error occured while trying to setup mint-event listener!")
				return
			}

			const nftContract = await connectToContract()

			nftContract.on("NewEpicNFTMinted", (from, tokenId) => {
				
				console.log("recieved a new nft minted event!", from, tokenId.toNumber())
				setTokenId(tokenId.toNumber())

			})


		} catch (error) {

			console.log("Error occured while trying to setup mint event listener!")
			console.error(error)

		}
	}

	const connectWallet = async () => {

		const toastId = toast.loading("Connecting to wallet..")

		await ethereum
			.request({ method: "eth_requestAccounts" })
			.then(async () => {
				
				toast.success("Successfully connected!", { id: toastId })

				const accounts = await ethereum.request({	method: "eth_accounts" })
				setCurrentAccount(accounts[0])

				setupEventListener()
				updateMintedSoFar()

			})
			.catch((err) => {

				if (err.code === 4001) {

					toast.error("User rejected the connection!", {id: toastId })
					return

				} else {

					console.log("An error occured -", err)
					toast.error("An error occured while connecting!", { id: toastId })
					return 
				}

			});
	};

	const mintNFT = async () => {

		try {
			if (!ethereum) {
				toast.error("Please install Metamask")
				return 
			}

			const res = await checkAndSwitchChain()

			if (res === "failed") {
				return ;
			}
			
			const toastId = toast.loading("Roasting your omlette...", { duration: 2000 })

			setTimeout(() => toast.loading("Adding spices...", {
						id: toastId,
						duration: 3000
			}), 1000)

			setTimeout(() => toast.loading("Minting it as NFT...", {
						id: toastId,
						duration: Infinity
			}), 3000)

			const nftContract = await connectToContract()

			if (!name) setName("anon")

			let txn = await nftContract.makeAnEpicNFT(name.toLowerCase())

			toast.loading("Transaction is being mined...", {
				id: toastId,
				duration: Infinity
			})

			await txn.wait()

			toast.success("Mined successfully!", {
				id: toastId,
				duration: 3000
			})
			
			setTransactionId(txn.hash)
			setupEventListener()
			updateMintedSoFar()
			
			setName("")
			
		} catch (error) {

			toast.dismiss()
			toast.error("Error occured, check console")
		}
	};

	useEffect(() => {

		checkIfAccountIsConnected()

		// eslint-disable-next-line
	}, [])

	return (
		<div className='App'>
			<div className='container'>

				<Toaster
					position='bottom-center'
					toastOptions={{
						style: {
							background: "black",
							color: "#fff",
							maxWidth: "800px",
							textAlign: "left",
						}
					}}
				/>

				<p className='header gradient-text'>Omelette Paradise</p>
				
				{currentAccount ? <p style={{ color: "whitesmoke", fontWeight: "500", fontSize: "1.2em" }}>({minted} OF 50 MINTED)</p> : ""}

				<p className='sub-text'>
					Super Delicious. High Protein. Mint your omelette now.
				</p>

				{currentAccount ? (
					<div className='mint-container'>
						<input
							type='text'
							placeholder='Enter your name'
							className='name-input'
							onChange={(e) => setName(e.target.value)}
						/>
						<button
							onClick={mintNFT}
							className='cta-button connect-wallet-button'>
							Mint NFT
						</button>
					</div>
				) : (
					<button
						onClick={connectWallet}
						className='cta-button connect-wallet-button'>
						Connect to Wallet
					</button>
				)}

				{transactionId && (
					<p style={{ color: "gray", marginTop: "2em" }}>
						Have a look at the transaction on 
						<a style={{ color: "orange", textUnderlineOffset: "5px" }} href={ "https://rinkeby.etherscan.io/tx/" + transactionId }>
							etherscan here
						</a>
					</p>
				)}

				{tokenId && (
					<p style={{ color: "gray" }}>
						Checkout your nft on
						<a style={{ color: "orange", textUnderlineOffset: "5px" }} href={ "https://rinkeby.rarible.com/token/" + contractAddress + ":" + tokenId}> rarible</a>
						. It might take few mins to load the metadata though!
					</p>
				)}

			</div>

			<footer>
				<p className='footer-link'>
					built by {""}
					<a href='https:twitter.com/sudhamjayanthi'>
						@sudhamjayanthi
					</a>
				</p>

				<p className='footer-link'>
					view collection on {" "}
					<a href='https://testnets.opensea.io/collection/omletteee-paradiseee'>
						opensea {" "}
					</a>
					🌊
				</p>
			</footer>
		</div>
	);
}

export default App;
