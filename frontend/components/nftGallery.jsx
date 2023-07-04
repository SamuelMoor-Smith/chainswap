import { useEffect, useState } from "react";
import styles from "../styles/NftGallery.module.css";
import stylesbutton from "../styles/NftCreator.module.css";
import { ConnectWallet, Web3Button, useAddress } from "@thirdweb-dev/react";
import { useChain } from "@thirdweb-dev/react";
import { MediaRenderer } from "@thirdweb-dev/react";
import { Mumbai, AvalancheFuji } from "@thirdweb-dev/chains";

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
  return chain && chain.name && (chain.name == "Mumbai" || chain.name == "Avalanche Fuji Testnet");
}

export default function NFTGallery({contractMap, activeChain}) {
  const [nfts, setNfts] = useState();
  const [isLoading, setIsloading] = useState(false);
  const [pageKey, setpageKey] = useState(null);
  const chain = useChain();

  const transfer = async (tokenId) => {
    console.log("transfer", tokenId);

    const destChainId = chain.name === "Mumbai" ? "43113" : "80001";

    // const requestMetadata = "0x000000000007a12000000006fc23ac0000000000000000000000000000000000000000000000000000000000000000000000";
    // const requestMetadata = await contractMap[chain.name].call(
    //   "getRequestMetadata",
    //   [1000000, 50000000000, 1000000, 50000000000, 1000000000000000, 0, false, ethers.utils.toUtf8Bytes('')]
    // )

    const requestMetadata = "0x000000000007a12000000006fc23ac0000000000000000000000000000000000000000000000000000000000000000000000";

    console.log(requestMetadata);
    console.log(destChainId);

    const ourContractOnChains = await contractMap[chain.name].call(
      "ourContractOnChains",
      [destChainId]
    )

    console.log(ourContractOnChains);
    if (ourContractOnChains == "") {
      throw new Error("No contract on that chain");
    }

    console.log("transaction started")

    const tx = await contractMap[chain.name].call(
      "transferCrossChain",
      [destChainId, tokenId, requestMetadata]
    );
    console.log(tx.receipt, tx.receipt.transactionHash);

    window.alert('Transfer sent. Your transaction id for crosschain transfer is: ' + tx.receipt.transactionHash);
  }
  const fetchNFTs = async ( pagekey) => {
    if (!pageKey) setIsloading(true);
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
    } catch (e) {
      console.log(e);
    }

    setIsloading(false);
  };

  useEffect(() => {
    fetchNFTs();
  }, [chain, activeChain]);

  return (
    <div className={styles.nft_gallery_page}>
      <div>
        <div className={styles.fetch_selector_container}>
          <h2 style={{ fontSize: "20px" }}>Explore your NFTs by Chain</h2>
        </div>
        <div className={styles.inputs_container}>
          <div className={styles.input_button_container}>
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

        <div className={styles.description_container}>
          <p>{nft.description}</p>
        </div>
        {chain.name == Mumbai.name && <button className={stylesbutton.button} onClick={() => transfer(nft.tokenId)}>Transfer to Fuji</button>}
        {chain.name == AvalancheFuji.name && <button className={stylesbutton.button} onClick={() => transfer(nft.tokenId)}>Transfer to Mumbai</button>}
      </div>
    </div>
  );
}
