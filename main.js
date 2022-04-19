
// Blockchain Node
const serverUrl = "https://opoyoshueneg.usemoralis.com:2053/server";
const appId = "aJsOq9oXrG0zOWbebfuWodJTSohoIR3KCYWuwIm1";

// NFT Collection (we can make it change depending on the input of the user in the frontend)
const contractID = '0xc8adfb4d437357d0a656d4e62fd9a6d22e401aa0';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
Moralis.start({ serverUrl, appId });
let currentUser = Moralis.User.current();

async function initUser() {
  if (!currentUser) {
    currentUser = await Moralis.Web3.authenticate();
  }
}

async function initProject() {
  await initUser();
}

async function getCollections(event) {
  event.preventDefault();

  const options = {
    address: contractID,
    chain: "ETH",
  };
  const web3 = await Moralis.enableWeb3();
  let NFTs = await Moralis.Web3API.token.getAllTokenIds(options);
  const body = document.getElementById("collectionsBody");
  let count = 0;
  NFTs["result"].map(async (nft) => {
    count++;
    // We limit it to only show 10 NFT's to make sure we don't overload our node
    if (count <= 10) {
      const options = {
        address: contractID,
        token_id: nft["token_id"],
        chain: "eth",
      };
      if (nft["metadata"]) {
        const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(
          options
        );
        fetch(nft["token_uri"]).then(async (response) => {
          const res = await response.json();
          let image = res["image"];
          const name = res["name"];
          image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
          body.innerHTML += `<div class="col-4 my-4 d-flex justify-content-center">
              <div class="card w-80">
                <img class="card-img-top" src="${image}">
                <div class="card-body">
                  <h5 class="card-title">${res["name"]}</h5>
                  <p class="card-text">${res["description"]}</p>
                  <div>
                    <a href="/transactions.html?contract=${options.address}&tokenId=${options.token_id}&name=${res["name"]}" class="btn btn-primary">Transactions</a>
                  </div>
                </div>
              </div>
            </div>`;
        });
      }
    }
  });
}

initUser();

async function getTransactions(event) {
  event.preventDefault();
  const contract = urlParams.get("contract");
  const tokenId = urlParams.get("tokenId");
  const name = urlParams.get("name");
  const tableBody = document.getElementById("transactionBody");
  const pageTitle = document.getElementById("pageTitle");
  const options = {
    address: contract,
    token_id: tokenId,
    chain: "eth",
  };
  if (contract && tokenId && tableBody && pageTitle) {
    pageTitle.innerHTML = 'Transactions of ' + name;
    const transfers = await Moralis.Web3API.token.getWalletTokenIdTransfers(
      options
    );
    if (transfers["result"]) {
      transfers["result"].map((transaction) => {
        tableBody.innerHTML += `<tr> <th>${transaction["transaction_index"]}</th> <th>${transaction["transaction_type"]}</th> <th>${transaction["amount"]}</th> <th>${transaction["block_number"]}</th> <th>${transaction["block_timestamp"]}</th> <th>${transaction["from_address"]}</th> <th>${transaction["to_address"]}</th> <th>${transaction["transaction_hash"]}</th> </tr>`;
      });
    }
  }
}
