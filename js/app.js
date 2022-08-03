let web3 = new web3js.myweb3(window.ethereum);
let addr;

const sttaddr = "0x86d0412fe24d334C6bA2b04ADD4a9140E8Cf9028";
const sttabi = [
  {
    "inputs": [],
    "name": "buyOnPresale",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getUserTokenBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getUserEthBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStageStateVariables",
    "outputs": [
      {
        "internalType": "enum BasedTokenPresale.TOKEN_STATE",
        "name": "",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
];

let sttcontract = new web3.eth.Contract(sttabi, sttaddr);


//***************** our smart-contract integration *****************/

const buystt = async () => {
  await loadweb3();
  const chainId = await web3.eth.getChainId();
  if (addr == undefined) {
    Swal.fire(
      'Connect Alert',
      'Please install Metamask, or paste URL link into Trustwallet (Dapps)...',
      'error'
    )
  }
  if (chainId !== 4) { //Change for LIVE
    Swal.fire(
      'Connect Alert',
      'Please Connect on Rinkeby', //Change for LIVE
      'error'
    )
  }

  let ethval = document.getElementById("buyinput").value;
  if (ethval >= 0.01) {
    ethval = (ethval * Math.pow(10, 18));

    sttcontract.methods.buyOnPresale().send({ from: addr, value: ethval }).then(function (error, result) {
      Swal.fire(
        'Success!',
        'Thank you for your purchase!',
        'info'
      )
    }, function (e, processedContract) {
      Swal.fire(
        'Error!',
        'Transaction rejected!',
        'error'
      )
    });
  } 
  else {
    Swal.fire(
      'Buy Alert',
      'Buy as low as 0.01 ETH.',
      'error'
    )
  }
}


const loadweb3 = async () => {
  try {
    web3 = new web3js.myweb3(window.ethereum);
    console.log('Injected web3 detected.')
    sttcontract = new web3.eth.Contract(sttabi, sttaddr);
    let a = await ethereum.enable();
    addr = web3.utils.toChecksumAddress(a[0]);
    return (addr);

  } catch (error) {
    if (error.code === 4001) {
      console.log('Please connect to MetaMask.')
    } else {
      Swal.fire(
        'Connect Alert',
        'Please install Metamask!',
        'error'
      )
    }
  }
};

//***************** display user token balance *****************/

const showbalance = async () => {
  await loadweb3();
  const chainId = await web3.eth.getChainId();
  if (addr == undefined) {
    Swal.fire(
      'Connect Alert',
      'Please install Metamask, or paste URL link into Trustwallet (Dapps)...',
      'error'
    )
  }
  if (chainId !== 4) { //Change for LIVE
    Swal.fire(
      'Connect Alert',
      'Please Connect on Rinkeby', //Change for LIVE
      'error'
    )
  }

  let userTokenBalance = await sttcontract.methods.getUserTokenBalance(addr).call({from: addr});
  let userEthBalance = await sttcontract.methods.getUserEthBalance(addr).call({from: addr});
  let tokenState = await sttcontract.methods.getStageStateVariables().call({from:addr});
  let totalSupply = await sttcontract.methods.totalSupply().call({from: addr});
  let currentTokenStage = tokenState[0];
  let currentTokenStageName;
  switch(currentTokenStage) {
    case "0": 
      currentTokenStageName = "Presale Not Started" 
      break
    case "1": 
      currentTokenStageName = "Presale Stage 1" 
      break
    case "2": 
      currentTokenStageName = "Presale Stage 2" 
      break
    case "3": 
      currentTokenStageName = "Presale Finished" 
      break  
  }
  let currentTokenLimit = (tokenState[1]/ Math.pow(10, 18));
  let currentTokenPrice = (tokenState[2]/ Math.pow(10, 18));


  totalSupply = (totalSupply / Math.pow(10, 18));
  userTokenBalance = (userTokenBalance / Math.pow(10, 18));
  userEthBalance = (userEthBalance / Math.pow(10, 18));

  console.log(currentTokenStageName, currentTokenLimit, currentTokenPrice, totalSupply);

  document.getElementById("currstage").innerHTML = `Current Stage: ${currentTokenStageName}`;
  document.getElementById("bdtbalance").innerHTML = `Your BDT balance: ${userTokenBalance}`;
  document.getElementById("ethbalance").innerHTML = `Your ETH balance in BDT: ${userEthBalance}`;
  document.getElementById("currprice").innerHTML = `Buy ${currentTokenPrice} ETH = 1 BDT`;
  document.getElementById("currlimit").innerHTML = `${currentTokenLimit - totalSupply} BDT left to buy until next stage!`;
}


//***************** adding our token to wallet *****************/

function addToWallet() {
  try {
    web3.currentProvider.sendAsync({
      method: 'wallet_watchAsset',
      params: {
        'type': 'ERC20',
        'options': {
          'address': '0x86d0412fe24d334C6bA2b04ADD4a9140E8Cf9028',
          'symbol': 'BDT',
          'decimals': '18'
        },
      },
      id: Math.round(Math.random() * 100000)
    }, function (err, data) {
      if (!err) {
        if (data.result) {
          console.log('Token added');
        } else {
          console.log(data);
          console.log('Some error');
        }
      } else {
        console.log(err.message);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

//***************** some beauty jewelry  *****************/

// Set the date we're counting down to
var countDownDate = new Date("August 7, 2022 15:37:25").getTime();

// Update the count down every 1 second
var x = setInterval(function () {

  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("demo").innerHTML = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("demo").innerHTML = "EXPIRED";
  }
}, 1000);
