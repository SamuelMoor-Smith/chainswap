import styles from "../styles/Home.module.css";
import NFTGallery from "../components/nftGallery";
import NftCreator from "../components/nftCreator";

import XERC1155WithURIsABI from '../contract/XERC1155WithURIsABI.json';
import { useContract } from "@thirdweb-dev/react";

export const MUMBAI_ADDRESS = "0x0589d7d478EC4Ad0BFF0Ec468EeB6E46622F8886";
export const FUJI_ADRESS = "0x329156265AFeCfCe1c504612715693f9954609Ab";

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
