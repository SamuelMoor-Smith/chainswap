import styles from "../styles/Home.module.css";
import NFTGallery from "../components/nftGallery";
import NftCreator from "../components/nftCreator";

import XERC1155WithURIsABI from '../contract/XERC1155WithURIsABI.json';
import { useContract } from "@thirdweb-dev/react";

export const MUMBAI_ADDRESS = "0x009646443dAF0ac64398bbf9b6040d914b7547f0";
export const FUJI_ADRESS = "0x2b648DaF64C694dFc90584E28390100CD4d7a018";

export default function Home({appState, setAppState, activeChain}) {

  const mumbai_contract_hook = useContract(MUMBAI_ADDRESS, XERC1155WithURIsABI);
  const fuji_contract_hook = useContract(FUJI_ADRESS, XERC1155WithURIsABI);

  
  const contractMap = {
    "Mumbai": mumbai_contract_hook.contract,
    "Avalanche Fuji Testnet": fuji_contract_hook.contract
  }

  return (
    <div>
      <main className={styles.main}>
        {appState != "gallery" && <NftCreator contractMap={contractMap}/>}
        {appState == "gallery" && <NFTGallery activeChain={activeChain} contractMap={contractMap}/>}
      </main>
    </div>
  );
}
