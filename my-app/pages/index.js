import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);

  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  const [loading, setLoading] = useState(false);
 
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
 
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);


    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
    
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
 
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
  
      await tx.wait();
      setLoading(false);
    
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */
  const getNumberOfWhitelisted = async () => {
    try {
   
      const provider = await getProviderOrSigner();
      
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
    
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async () => {
    try {
    
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
     
      const address = await signer.getAddress();
     
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
     
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  /*
    renderButton: Returns a button based on the state of the dapp
  */
    const renderButton = () => {
      if (walletConnected) {
        if (joinedWhitelist) {
          return (
            <div className={styles.description}>
              <p className={styles.joinedText}>
                Thanks for joining the Whitelist! #COYG 🔴 ⚪️
              </p>
            </div>
          );
        } else if (loading) {
          return <div className={styles.spinner}></div>;
        } else {
          return (
            <button onClick={addAddressToWhitelist} className={styles.button}>
              <span className={styles.joinText}>Join the Whitelist</span> <span className={styles.joinHeart}>&#x1F680;</span>
            </button>
          );
        }
      } else {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        );
      }
    };   


  useEffect(() => {
   
    if (!walletConnected) {
    
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        {/* Head tag content */}
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to the Red & White Army!</h1>
          <div className={styles.description}>
            {/* Updated text */}
            It's an NFT collection for Arsenal Fans.
          </div>
          <div className={styles.description}>
            {/* Updated text */}
            {numberOfWhitelisted} fans have already joined the Whitelist!
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./Emirates_Stadium_Logo_Arsenal.jpeg" alt="Emirates Stadium" />
        </div>
      </div>
  
      <footer className={styles.footer}>
        {/* Updated text */}
        Made with &#10084; for Arsenal Fans all over the world. ❤️ 🤍
      </footer>
    </div>
  );
}