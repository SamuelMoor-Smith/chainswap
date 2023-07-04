import { useEffect } from "react";
import Navbar from "../components/navigation/navbar";
import { useChainId } from "@thirdweb-dev/react";
import { Mumbai, AvalancheFuji } from "@thirdweb-dev/chains";

export default function MainLayout({ children, appState, setAppState, activeChain, setActiveChain }) {
	const chainId = useChainId();
	useEffect(() => {
		if(chainId !== activeChain.chainId) {
			setActiveChain(chainId === 80001 ? Mumbai : AvalancheFuji);
		}
	}, [chainId]);
	return (
		<div>
            <Navbar setAppState={setAppState}/>
            {children}
		</div>
	);
}
