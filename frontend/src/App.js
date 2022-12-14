//import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';

import LotteryContract from './artifacts/contracts/ICO.sol/ICO.json';

function App() {

  const [userAccount, setUserAccount] = useState('');

  const [tokenAddress, setTokenAddress] = useState('');
  const [admin, setAdmin] = useState('');
  const [end, setEnd] = useState('');
  const [price, setPrice] = useState('');
  const [availableTokens, setAvailableTokens] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxPurchase, setMaxPurchase] = useState('');
  const [released, setReleased] = useState('');

  const [inputDuration, setInputDuration] = useState('');
  const [inputPrice, setInputPrice] = useState('');
  const [inputAvailableTokens, setInputAvailableTokens] = useState('');
  const [inputMinPurchase, setInputMinPurchase] = useState('');
  const [inputMaxPurchase, setInputMaxPurchase] = useState('');

  const [inputValueBuy, setInputValueBuy] = useState('');

  const [inputAddressWhitelist, setInputAddressWhitelist] = useState('');

  const addressContract = '0x34D4d2E698Abd91c1Ab4ab62744673D2cb5EB7Ea';
  
  let contractDeployed = null;
  let contractDeployedSigner = null;
  
  async function getProvider(connect = false){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (contractDeployed == null){
      contractDeployed = new ethers.Contract(addressContract, LotteryContract.abi, provider)
    }
    if (contractDeployedSigner == null){
      if (connect){
        let userAcc = await provider.send('eth_requestAccounts', []);
        setUserAccount(userAcc[0]);
      }
      contractDeployedSigner = new ethers.Contract(addressContract, LotteryContract.abi, provider.getSigner());
    }
  }

  async function disconnect(){
    try {
      setUserAccount('');
    } catch (error) {
      
    }
  }

  useEffect(() => {
    getData()
  }, [])

  function toastMessage(text) {
    toast.info(text)  ;
  }

  function toTimestamp(strDate){
    let dateFormatted = Date.parse(strDate);
    return dateFormatted;
  }

  function formatDate(dateTimestamp){
    let date = new Date(parseInt(dateTimestamp));
    let dateFormatted = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() ;
    return dateFormatted;
  }

  async function getData(connect = false) {
    
    await getProvider(connect);
    
    const currState = (await contractDeployed.released())
    if (currState){
      setReleased("True")
    }else {
      setReleased("Not yet")
    }
    setTokenAddress(await contractDeployed.token())
    setEnd((await contractDeployed.end()).toString())
    setPrice((await contractDeployed.price()).toString())
    setAvailableTokens((await contractDeployed.availableTokens()).toString())
    setMinPurchase((await contractDeployed.minPurchase()).toString())
    setMaxPurchase((await contractDeployed.maxPurchase()).toString())
    
    setAdmin(await contractDeployed.admin())  
    
  }

  async function handleStart(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.start(inputDuration, inputPrice, inputAvailableTokens, inputMinPurchase, inputMaxPurchase);  
      console.log(resp);
      toastMessage("ICO started")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleCheckWhitelist(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.checkWhiteList();  
      if (resp){
        toastMessage("You are whitelisted")
      }else{
        toastMessage("You are not whitelisted")
      }
      
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleApproveInWhitelist(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.whiteList(inputAddressWhitelist);  
      toastMessage("Approved in whitelist")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleBuy(){
    await getProvider(true);
    try {
      console.log(inputValueBuy);
      const resp  = await contractDeployedSigner.buy({value: inputValueBuy});  
      toastMessage("Tokens bought")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleRelease(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.release();  
      toastMessage("Released")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  return (
    <div className="container">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="ICO" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>
        
        {
          userAccount =='' ?<>
            <h2>Connect your wallet</h2>
            <button onClick={() => getData(true)}>Connect</button>
          </>
          :<>
            <h2>User data</h2>
            <p>User account: {userAccount}</p>
            <button onClick={disconnect}>Disconnect</button></>
        }
        
        <hr/>
        <h2>ICO data</h2>
        <p>Admin: {admin}</p>
        <p>Released: {released}</p>
        <p>Token address: {tokenAddress}</p>
        <p>Token Price: {price}</p>
        <p>End: {end}</p>
        <p>Available tokens: {availableTokens}</p>
        <p>Min Purchase: {minPurchase}</p>
        <p>Max Purchase: {maxPurchase}</p>
        <hr/>

        <h2>Start ICO (only admin)</h2>
        <input type="text" placeholder="Duration" onChange={(e) => setInputDuration(e.target.value)} value={inputDuration}/>
        <input type="text" placeholder="Price" onChange={(e) => setInputPrice(e.target.value)} value={inputPrice}/>
        <input type="text" placeholder="Available tokens" onChange={(e) => setInputAvailableTokens(e.target.value)} value={inputAvailableTokens}/>
        <input type="text" placeholder="Min Purchase" onChange={(e) => setInputMinPurchase(e.target.value)} value={inputMinPurchase}/>
        <input type="text" placeholder="Max Purchase" onChange={(e) => setInputMaxPurchase(e.target.value)} value={inputMaxPurchase}/>
        <button onClick={handleStart}>Click to start the ICO</button>
        <hr/>

        <h2>Approve in whitelist (only admin)?</h2>
        <input type="text" placeholder="Address" onChange={(e) => setInputAddressWhitelist(e.target.value)} value={inputAddressWhitelist}/>
        <button onClick={handleApproveInWhitelist}>Approve</button>

        <h2>Are you in whitelist?</h2>
        <button onClick={handleCheckWhitelist}>Check</button>

        <h2>Buy tokens</h2>
        <input type="text" placeholder="Value in wei to buy tokens" onChange={(e) => setInputValueBuy(e.target.value)} value={inputValueBuy}/>
        <button onClick={handleBuy}>Buy tokens</button>

        <h2>Release (only admin)</h2>
        <button onClick={handleRelease}>Release</button>
                       
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} ethersjs={true} />
      <WRFooter /> 
    </div>
  );
}

export default App;
