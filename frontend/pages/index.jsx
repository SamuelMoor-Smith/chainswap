import styles from "../styles/Home.module.css";
import NFTGallery from "../components/nftGallery";
import NftCreator from "../components/nftCreator";

import XERC1155WithURIsABI from '../contract/XERC1155WithURIsABI.json';
import { useContract } from "@thirdweb-dev/react";

export const MUMBAI_ADDRESS = "0x8e633bA9E6392fB5607FB20E2155D5503e862413";
export const FUJI_ADRESS = "0x6a468027c8Dc76985cfB196F507FC78c091CEcD3";

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
