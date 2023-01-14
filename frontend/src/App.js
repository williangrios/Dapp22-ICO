import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';
import Button from "react-bootstrap/Button";

import { compactAddress } from "./utils";
import meta from "./assets/metamask.png";

import ICOContract from './artifacts/contracts/ICO.sol/ICO.json';
 
function App() {

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [provider, setProvider] = useState();
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();

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

  const contractAddress = '0x34D4d2E698Abd91c1Ab4ab62744673D2cb5EB7Ea';
  
  async function handleConnectWallet (){
    try {
      setLoading(true);
      
      let userAcc = await provider.send('eth_requestAccounts', []);
      setUser({account: userAcc[0], connected: true});
      
      const contrSig = new ethers.Contract(contractAddress, ICOContract.abi, provider.getSigner())
      setSigner( contrSig)
    } catch (error) {
      console.log(error);
      if (error.message == 'provider is undefined'){
        toastMessage('No provider detected.')
      } else if(error.code === -32002){
        toastMessage('Check your metamask')
      }
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    async function getData() {
      try {
        console.log('get data init');
        const {ethereum} = window;
        if (!ethereum){
          toastMessage('Metamask not detected');
          return
        }
        const prov =  new ethers.providers.Web3Provider(window.ethereum);
        setProvider(prov);
        const contr = new ethers.Contract(contractAddress, ICOContract.abi, prov);
        setContract(contr);
        
        if (! await isGoerliTestnet()){
          toastMessage('Change to goerli testnet.')
          return;
        }

        //contract data
        const currState = (await contr.released())
        if (currState){
          setReleased("True")
        }else {
          setReleased("Not yet")
        }
        setTokenAddress(await contr.token())
        setEnd((await contr.end()).toString())
        setPrice((await contr.price()).toString())
        setAvailableTokens((await contr.availableTokens()).toString())
        let minVal =(await contr.minPurchase()).toString()
        setMinPurchase(minVal)
        let maxVal = (await contr.maxPurchase()).toString()
        setMaxPurchase(maxVal)
        setAdmin(await contr.admin())  
  
        console.log('get data end');
      } catch (error) {
        toastMessage(error.reason)        
      }
    }
    getData()  
  }, [])
  
  function isConnected(){
    if (!user.connected){
      toastMessage('You are not connected!')
      return false;
    }
    return true;
  }

  async function isGoerliTestnet(){
    const goerliChainId = "0x5";
    const respChain = await getChain();
    return goerliChainId == respChain;
  }

  async function getChain() {
    const currentChainId = await  window.ethereum.request({method: 'eth_chainId'})
    return currentChainId;
  }

  async function handleDisconnect(){
    try {
      setUser({});
      setSigner(null);
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }

  async function executeSigner(func, successMessage){
    try {
      if (!isConnected()) {
        return;
      }
      if (!await isGoerliTestnet()){
        toastMessage('Change to goerli testnet.')
        return;
      }
      setLoading(true);
      const resp = await func;  
      toastMessage("Please wait.")
      await resp.wait();
      toastMessage(successMessage)
    } catch (error) {
      console.log(error);
      toastMessage(error.reason)      
    } finally{
      setLoading(false);
    }
  }


  async function handleStart(){
    if (signer === undefined || signer === null){
      toastMessage("Please, connect your metamask")
      return
    }
    const func = signer.start(inputDuration, inputPrice, inputAvailableTokens, inputMinPurchase, inputMaxPurchase);  
    executeSigner(func, "Ico Started.")    
  }

  async function handleCheckWhitelist(){
    if (signer === undefined || signer === null){
      toastMessage("Please, connect your metamask")
      return
    }
    const resp = await signer.checkWhiteList();  
    if (resp){
      toastMessage("You are whitelisted")
    }else{
      toastMessage("You are not whitelisted")
    }
  }

  async function handleApproveInWhitelist(){
    if (signer === undefined || signer === null){
      toastMessage("Please, connect your metamask")
      return
    }
    const func = signer.whiteList(inputAddressWhitelist);  
    executeSigner(func, "Approved in whitelist.")    
  }

  async function handleBuy(){
    if (signer === undefined || signer === null){
      toastMessage("Please, connect your metamask")
      return
    }
    const func = signer.buy({value: inputValueBuy});  
    executeSigner(func, "Tokens bought.")    
  }

  async function handleRelease(){
    if (signer === undefined || signer === null){
      toastMessage("Please, connect your metamask")
      return
    }
    const func = signer.release();  
    executeSigner(func, "Released.")    
  }

  return (
    <div className="container">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="ICO" image={true} />
      <WRInfo chain="Goerli" testnet={true} />
      <WRContent>
        
      <h1>ICO</h1>
        {loading && 
          <h1>Loading....</h1>
        }

        { !user.connected ?<>
            <Button className="commands " variant="btn btn-primary" onClick={handleConnectWallet}>
              <img src={meta} alt="metamask" width="30px" height="30px"/>Connect to Metamask
            </Button>
            </>
          : <>
            <label>Welcome {compactAddress(user.account)}</label>
            <button className="btn btn-primary commands" onClick={handleDisconnect}>Disconnect</button>
          </>
        }

        <hr/>
        <h2>Contract data</h2>
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
        <input type="text" className="mb-1 commands" placeholder="Duration" onChange={(e) => setInputDuration(e.target.value)} value={inputDuration}/>
        <input type="number" className="mb-1 commands" placeholder="Price" onChange={(e) => setInputPrice(e.target.value)} value={inputPrice}/>
        <input type="number" className="mb-1 commands" placeholder="Available tokens" onChange={(e) => setInputAvailableTokens(e.target.value)} value={inputAvailableTokens}/>
        <input type="number" className="mb-1 commands" placeholder="Min Purchase" onChange={(e) => setInputMinPurchase(e.target.value)} value={inputMinPurchase}/>
        <input type="number"  className="mb-1 commands" placeholder="Max Purchase" onChange={(e) => setInputMaxPurchase(e.target.value)} value={inputMaxPurchase}/>
        <button className="btn btn-primary commands" onClick={handleStart}>Start ICO</button>
        

        <h2>Approve in whitelist (only admin)?</h2>
        <input type="text" className="mb-1 commands" placeholder="Address" onChange={(e) => setInputAddressWhitelist(e.target.value)} value={inputAddressWhitelist}/>
        <button className="btn btn-primary commands" onClick={handleApproveInWhitelist}>Approve</button>

        <h2>Are you in whitelist?</h2>
        <button className="btn btn-primary commands" onClick={handleCheckWhitelist}>Check</button>

        <h2>Buy tokens</h2>
        <label>{inputValueBuy}</label>
        <input className="mb-1 commands" type="range" placeholder="Value in wei to buy tokens" onChange={(e) => setInputValueBuy(e.target.value)} value={inputValueBuy} min={minPurchase} max={maxPurchase}/>
        <button className="btn mb-1 btn-primary commands" onClick={handleBuy}>Buy tokens</button>
        
        <h2>Release (only admin)</h2>
        <button className="btn btn-primary commands" onClick={handleRelease}>Release</button>
                       
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} ethersjs={true} />
      <WRFooter /> 
    </div>
  );
}

export default App;
