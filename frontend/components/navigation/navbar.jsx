import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../../styles/Navbar.module.css";
import stylesbutton from "../../styles/NftCreator.module.css";
export default function Navbar({setAppState}) {
	return (
		<nav className={styles.navbar}>
			<a href="https://alchemy.com/?a=create-web3-dapp" target={"_blank"}>
				<img
					className={styles.alchemy_logo}
					src="/alchemy_logo.svg"
				></img>
			</a>

			{/* Adding buttons to set state to either "gallery" or "minter" */}
			<button className={stylesbutton.button} onClick={() => setAppState('gallery')}>
				Gallery
			</button>
			<button className={stylesbutton.button} onClick={() => setAppState('minter')}>
				Minter
			</button>
			
			<ConnectWallet theme="light"/>
		</nav>
	);
}
