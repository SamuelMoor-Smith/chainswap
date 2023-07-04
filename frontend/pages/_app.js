import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import React, { useState } from 'react';
import MainLayout from "../layout/mainLayout";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Mumbai, AvalancheFuji } from "@thirdweb-dev/chains";


function MyApp({ Component, pageProps }) {
	const [state, setState] = useState("gallery");
	const [activeChain, setActiveChain] = useState(AvalancheFuji); // Mumbai or AvalancheFuji
	
	return (
		<ThirdwebProvider 
			activeChain={activeChain}
			supportedChains={[Mumbai, AvalancheFuji]}
		>
			<MainLayout setAppState={setState} activeChain={activeChain} setActiveChain={setActiveChain}>
				<Component {...pageProps} appState={state} activeChain={activeChain} setAppState={setState} />
			</MainLayout>
		</ThirdwebProvider>
	);
}

export default MyApp;
