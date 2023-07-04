import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../../styles/Navbar.module.css";
import stylesbutton from "../../styles/NftCreator.module.css";
export default function Navbar({setAppState}) {
	return (
		<nav className={styles.navbar}>
			<a href="https://github.com/SamuelMoor-Smith/router-crosstalk" target={"_blank"}>
				<div className={styles.logo_container}>
					<img
						className={styles.alchemy_logo}
						src="/swaplogo.png"
					/>
					<h1 style={{marginBottom: '0px'}}>ChainSwap</h1>
				</div>
			</a>

			<div className={styles.rightSide}>
                {/* Adding buttons to set state to either "gallery" or "minter" */}
                <button className={stylesbutton.button2} onClick={() => setAppState('gallery')}>
                    Gallery
                </button>
                <button className={stylesbutton.button2} onClick={() => setAppState('minter')}>
                    Minter
                </button>
                
                <ConnectWallet style={{ marginLeft: '30px' }} theme="light"/>
            </div>
		</nav>
	);
}
