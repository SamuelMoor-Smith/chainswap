import { useEffect, useState } from "react";
import styles from "../styles/NftGallery.module.css";
import stylesbutton from "../styles/NftCreator.module.css";
// import { useAccount } from "wagmi";
import { ConnectWallet, Web3Button, useAddress } from "@thirdweb-dev/react";
import { useChain } from "@thirdweb-dev/react";
import { MediaRenderer } from "@thirdweb-dev/react";
import { Mumbai, AvalancheFuji } from "@thirdweb-dev/chains";

import XERC1155WithURIsABI from '../contract/XERC1155WithURIsABI.json';
import { MUMBAI_ADDRESS, FUJI_ADRESS } from "../pages/index";
import { ethers } from 'ethers';

function hexToUtf8(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const v = parseInt(hex.substr(i, 2), 16);
    if (v) str += String.fromCharCode(v);
  }
  return str;
}

function isMumbaiOrFuji(chain) {
  console.log(chain);
  return chain && (chain.name == "Mumbai" || chain.name == "Avalanche Fuji Testnet");
}



export default function NFTGallery({contractMap, activeChain}) {
  const [nfts, setNfts] = useState();
  // const [walletOrCollectionAddress, setWalletOrCollectionAddress] =
  //   useState("vitalik.eth");
  // const [fetchMethod, setFetchMethod] = useState("wallet");
  const [pageKey, setPageKey] = useState();
  const [spamFilter, setSpamFilter] = useState(true);
  const [isLoading, setIsloading] = useState(false);
  // const { address, isConnected } = useAccount();
  const address = useAddress();
  const chain = useChain();

  const transfer = async (tokenId) => {
    console.log("transfer", tokenId);

    const destChainId = chain.name === "Mumbai" ? "43113" : "80001";

    const requestMetadata = "0x000000000007a12000000006fc23ac0000000000000000000000000000000000000000000000000000000000000000000000";

    const tx = await contractMap[chain.name].call(
      "transferCrossChain",
      [destChainId, tokenId, ethers.utils.toUtf8Bytes(requestMetadata)]
    );
    console.log(tx);
  }
  
  // const [chain, setChain] = useState(process.env.NEXT_PUBLIC_ALCHEMY_NETWORK);


  // const changeFetchMethod = (e) => {
  //   setNfts()
  //   setPageKey()
  //   switch (e.target.value) {
  //     case "wallet":
  //       setWalletOrCollectionAddress("vitalik.eth");

  //       break;
  //     case "collection":
  //       setWalletOrCollectionAddress(
  //         "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e"
  //       );
  //       break;
  //     case "connectedWallet":
  //       setWalletOrCollectionAddress(address);
  //       break;
  //   }
  //   setFetchMethod(e.target.value);
  // };
  const fetchNFTs = async ( pagekey) => {
    if (!pageKey) setIsloading(true);
    // const endpoint =
    //   fetchMethod == "wallet" || fetchMethod == "connectedWallet"
    //     ? "/api/getNftsForOwner"
    //     : "/api/getNftsForCollection";
    try {
      setNfts([])
      console.log("grabbing nfts");

      const tokenIdTracker = await contractMap[chain.name].call(
        "tokenIdTracker"
      );

      console.log("number of tokens", tokenIdTracker);
      console.log(tokenIdTracker.toNumber());
      let nfts = [];
      
      for (let tokenId = 0; tokenId < Number(tokenIdTracker.toNumber()); tokenId++) {
        try {
          console.log(tokenId);
          const tokenURI = await contractMap[chain.name].call(
            "getURI",
            tokenId.toString(),
          )
          console.log("tokenURI", tokenURI);
          let jsonString = hexToUtf8(tokenURI);
          let jsonObject = JSON.parse(jsonString);
          jsonObject.tokenId = tokenId;
          nfts.push(jsonObject);
        } catch (e) {
          console.log(e);
        }
      };

      setNfts(nfts)


      // console.log(mintTx)
      // setTxHash(mintTx.hash);
      // const res = await fetch(endpoint, {
      //   method: "POST",
      //   body: JSON.stringify({
      //     address:
      //       fetchMethod == "connectedWallet"
      //         ? address
      //         : walletOrCollectionAddress,
      //     pageKey: pagekey ? pagekey : null,
      //     chain: chain,
      //     excludeFilter: spamFilter,
      //   }),
      // }).then((res) => res.json());
      // if (nfts?.length && pageKey) {
      //   setNfts((prevState) => [...prevState, ...res.nfts]);
      // } else {
      //   setNfts();
      //   setNfts(res.nfts);
      // }
      // if (res.pageKey) {
      //   setPageKey(res.pageKey);
      // } else {
      //   setPageKey();
      // }
    } catch (e) {
      console.log(e);
    }

    setIsloading(false);
  };

  useEffect(() => {
    fetchNFTs();
  }, [chain, activeChain]);
  // useEffect(() => {
  //   fetchNFTs();
  // }, [spamFilter]);

  return (
    <div className={styles.nft_gallery_page}>
      <div>
        <div className={styles.fetch_selector_container}>
          <h2 style={{ fontSize: "20px" }}>Explore your NFTs by Chain</h2>
          {/* <div className={styles.select_container}>
            <select
              defaultValue={"wallet"}
              onChange={(e) => {
                changeFetchMethod(e);
              }}
            >
              <option value={"chain"}>chain</option>
              <option value={"collection"}>collection</option>
              <option value={"connectedWallet"}>connected wallet</option>
            </select>
          </div> */}
        </div>
        <div className={styles.inputs_container}>
          <div className={styles.input_button_container}>
            {/* <input
              value={walletOrCollectionAddress}
              onChange={(e) => {
                setWalletOrCollectionAddress(e.target.value);
              }}
              placeholder="Insert NFTs contract or wallet address"
            ></input> */}
            {/* <div className={styles.select_container}>
              <select
                onChange={(e) => {
                  // setChain(e.target.value);
                }}
                defaultValue={"MUMBAI"}
              >
                <option value={"MUMBAI"}>Mumbai</option>
                <option value={"FUJI"}>Avalanche Fuji</option>
                <option value={"ETH_GOERLI"}>Goerli</option>
                <option value={"MATIC_MUMBAI"}>Mumbai</option>
              </select>
            </div> */}
            <ConnectWallet theme="light"/>
            <div onClick={() => fetchNFTs()} className={styles.button_black}>
              <a>Search</a>
            </div>
          </div>
        </div>
      </div>


      {isLoading ? (
        <div className={styles.loading_box}>
          <p>Loading...</p>
        </div>
      ) : (
        <div className={styles.nft_gallery}>
          {/* {nfts?.length && (
            <div
              style={{
                display: "flex",
                gap: ".5rem",
                width: "100%",
                justifyContent: "end",
              }}
            >
              <p>Hide spam</p>
              <label className={styles.switch}>
                <input
                  onChange={(e) => setSpamFilter(e.target.checked)}
                  checked={spamFilter}
                  type="checkbox"
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>
          )} */}


          <div className={styles.nfts_display}>
              {isMumbaiOrFuji(chain) ? (
                  nfts?.length ? (
                      nfts.map((nft, index) => {
                          return <NftCard key={index} nft={nft} chain={chain} transfer={transfer}/>;
                      })
                  ) : (
                      <div className={styles.loading_box}>
                          <p>No NFTs found for the selected address</p>
                      </div>
                  )
              ) : (
                  <div className={styles.loading_box}>
                      <p>Only Mumbai and Avalanche Fuji chains are handled at this point in time.</p>
                  </div>
              )}
          </div>
				</div>
			)}

      {pageKey && nfts?.length && (
        <div>
          <a
            className={styles.button_black}
            onClick={() => {
              fetchNFTs(pageKey);
            }}
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}
function NftCard({ nft, chain, transfer }) {
  console.log(chain);
  return (
    <div className={styles.card_container}>
      <div className={styles.image_container}>
        {nft.format == "mp4" ? (
          <video src={nft.image} controls>
            Your browser does not support the video tag.
          </video>
        ) : (
          // <img src={nft.image[0]}></img>

          <MediaRenderer src={nft.image[0] ?? ''} width={250} className='rounded-md'/>
        )}
      </div>
      <div className={styles.info_container}>
        <div className={styles.title_container}>
          <h3>{nft.name}</h3>
        </div>
        <hr className={styles.separator} />
        {/* <div className={styles.symbol_contract_container}>
          <div className={styles.symbol_container}>
            <p>{nft.symbol}</p>

            {nft.verified == "verified" ? (
              <img
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/2048px-Twitter_Verified_Badge.svg.png"
                }
                width="20px"
                height="20px"
              />
            ) : null}
          </div>
          <div className={styles.contract_container}>
            <p className={styles.contract_container}>
              {nft.contract?.slice(0, 6)}...
              {nft.contract?.slice(38)}
            </p>
            <img
              src={
                "https://etherscan.io/images/brandassets/etherscan-logo-circle.svg"
              }
              width="15px"
              height="15px"
            />
          </div>
        </div> */}

        <div className={styles.description_container}>
          <p>{nft.description}</p>
        </div>
        {chain.name == Mumbai.name && <button className={stylesbutton.button} onClick={() => transfer(nft.tokenId)}>Transfer to Fuji</button>}
        {chain.name == AvalancheFuji.name && <button className={stylesbutton.button} onClick={() => transfer(nft.tokenId)}>Transfer to Mumbai</button>}
        {/* {chain.name == Mumbai.name && <Web3Button
          contractAddress={MUMBAI_ADDRESS}
          contractAbi={XERC1155WithURIsABI}
          action={(contract) => console.log(contract)}
        >Transfer to Fuji</Web3Button>}
        {chain.name == AvalancheFuji.name && <Web3Button
          contractAddress={FUJI_ADRESS}
          contractAbi={XERC1155WithURIsABI}
          action={(contract) => console.log(contract)}
        >Transfer to Mumbai</Web3Button>} */}
      </div>
    </div>
  );
}
