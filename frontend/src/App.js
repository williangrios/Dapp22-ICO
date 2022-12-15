import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

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
    
    try {
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
      let minVal =(await contractDeployed.minPurchase()).toString()
      setMinPurchase(minVal)
      let maxVal = (await contractDeployed.maxPurchase()).toString()
      setMaxPurchase(maxVal)
      setAdmin(await contractDeployed.admin())  
    } catch (error) {
      toastMessage('Install the metamask in your browser. If you has, change to goerli testnet');
    }
    
  }

  async function handleStart(){
    toastMessage("entrou")
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
            <div className="row col-3 mb-3 justify-content-center">
              <button className="btn btn-primary" onClick={() => getData(true)}>Connect</button>
            </div>
            
          </>
          :<>
            <h2>User data</h2>
            <label>User account: {userAccount}</label>
            <button className="btn btn-primary col-3" onClick={disconnect}>Disconnect</button>
          </>          
            
        }
        
        <hr/>
        <h2>ICO data</h2>
        <label>Admin: {admin}</label>
        <label>Released: {released}</label>
        <label>Token address: {tokenAddress}</label>
        <label>Token Price: {price}</label>
        <label>End: {end}</label>
        <label>Available tokens: {availableTokens}</label>
        <label>Min Purchase: {minPurchase}</label>
        <label>Max Purchase: {maxPurchase}</label>
        <hr/>

        <h2>Start ICO (only admin)</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="text" className="mb-1" placeholder="Duration" onChange={(e) => setInputDuration(e.target.value)} value={inputDuration}/>
          <input type="number" className="mb-1" placeholder="Price" onChange={(e) => setInputPrice(e.target.value)} value={inputPrice}/>
          <input type="number" className="mb-1" placeholder="Available tokens" onChange={(e) => setInputAvailableTokens(e.target.value)} value={inputAvailableTokens}/>
          <input type="number" className="mb-1" placeholder="Min Purchase" onChange={(e) => setInputMinPurchase(e.target.value)} value={inputMinPurchase}/>
          <input type="number"  className="mb-1" placeholder="Max Purchase" onChange={(e) => setInputMaxPurchase(e.target.value)} value={inputMaxPurchase}/>
          <button className="btn btn-primary" onClick={handleStart}>Start ICO</button>
        </div>
        

        <h2>Approve in whitelist (only admin)?</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="text" className="mb-1" placeholder="Address" onChange={(e) => setInputAddressWhitelist(e.target.value)} value={inputAddressWhitelist}/>
          <button className="btn btn-primary" onClick={handleApproveInWhitelist}>Approve</button>
        </div>

        <h2>Are you in whitelist?</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <button className="btn btn-primary" onClick={handleCheckWhitelist}>Check</button>
        </div>
        

        <h2>Buy tokens</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <label>{inputValueBuy}</label>
          <input className="mb-1" type="range" placeholder="Value in wei to buy tokens" onChange={(e) => setInputValueBuy(e.target.value)} value={inputValueBuy} min={minPurchase} max={maxPurchase}/>
          <button className="btn mb-1 btn-primary" onClick={handleBuy}>Buy tokens</button>
        </div>
        
        <h2>Release (only admin)</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <button className="btn btn-primary" onClick={handleRelease}>Release</button>
        </div>
                       
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} ethersjs={true} />
      <WRFooter /> 
    </div>
  );
}

export default App;
