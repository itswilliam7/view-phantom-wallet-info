import React, { useEffect, useState } from 'react';
import './App.css';
import {clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {AccountLayout, TOKEN_PROGRAM_ID} from "@solana/spl-token";


const App = () => {

  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [solBalance, setSolBalance] = useState(null);
  const [allAccounts, setAllAccounts] = useState([])

  // DOM = Document Object Model = all the html in the page
  
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log('Connected with Public Key:', response.publicKey.toString()
          );

          // GET BALANCE STUFF

          let connection = new Connection(clusterApiUrl("mainnet-beta"));
          let pubkey = new PublicKey(response.publicKey);
          const balance = await connection.getBalance(pubkey)
          if (balance)
            console.log('Solana Balance:', balance / LAMPORTS_PER_SOL);

          // END GET BALANCE STUFF    


          // SPL TOKEN BALANCE

          window.Buffer = require("buffer").Buffer;
          const tokenAccounts = await connection.getTokenAccountsByOwner(
            new PublicKey(response.publicKey),
            {
              programId: TOKEN_PROGRAM_ID,
            }
          );

          /* console.log("Token                                         Balance");
          console.log("------------------------------------------------------------"); */
          
          // eslint-disable-next-line array-callback-return
          const newAllAccount = tokenAccounts.value.map((e, index) => {
            const accountInfo = AccountLayout.decode(e.account.data);
            const publicKey = new PublicKey(accountInfo.mint);
            const accountBalance = Number(accountInfo.amount) / LAMPORTS_PER_SOL;  
          return {  
              accountId : publicKey.toString(),
              balance : accountBalance // need to change from scientific to big number
          }
        }  )
        
          // END SPL TOKEN BALANCE

          /*
           * Set the user's publicKey in state to be used later!
           */
          setAllAccounts(newAllAccount)
          setWalletAddress(response.publicKey.toString());
          setSolBalance(balance / LAMPORTS_PER_SOL);
          

        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
  
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());

    }
  };

console.log("allAccounts", allAccounts)
  
// SIGN IN SECTION
  
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button button"
      onClick={connectWallet}>Connect to Wallet</button>
  );


  // LOGGED IN AREA
  // JSX = resemble HTML but it is HTML
  // walletAddress = "my address"
  // button => setWalletAddress("my new address")  
  
  const renderConnectedContainer = () => (
    <div className='solWalletAddress'>
      <p>Connected Wallet: {walletAddress}</p>
      <p>Solana Balance: {solBalance}</p>
      </div>
  );


  const renderConnectedContainer2 = () => {

    // allAccounts = array of data 
    // => array of element that will use the data and display it
    // .map()
    // .map() = loop on an array and RETURNS an array
    // .forEach() === for loop it DOESNT returns an array
    // const myArray = [{ account : 25151, balance: 1351351}, {account : 25151, balance: 1351351}, {account : 25151, balance: /// 1351351}]

    
    // eslint-disable-next-line array-callback-return
    return allAccounts.map((element, index) => {
      
      // console.log(`${new PublicKey(accountInfo.mint) string || number (integer, float)}   ${accountInfo.amount}`);
      console.log("balance", element.balance)
      if (element.balance > 1)
      return (
        <div className='walletAddress' key={index}>
          <p>Token: {element.accountId} [{element.balance}]</p> 
        </div>
      )
      
    }) 
    
  }

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);


  

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
          {walletAddress && renderConnectedContainer()}
          {walletAddress && renderConnectedContainer2()}
        </div>
      </div>
    </div>
  );
};

export default App;