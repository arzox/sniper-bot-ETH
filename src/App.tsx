import {useCallback, useEffect, useState} from "react";
import {quote} from "./lib/quote";
import {FeeAmount} from "@uniswap/v3-sdk";
import tokenInfo from "./lib/tokenInfo";
import {WETH} from "./lib/constants";
import getTokenFromAddress from "./lib/tokenInfo";

const App = () => {

    const [price, setPrice] = useState("0")
    const onQuote = useCallback(async () => {
        let tokenSeek = await getTokenFromAddress("0x6982508145454ce325ddbe47a25d4ec3d2311933")
        setPrice(await quote(tokenSeek, WETH, FeeAmount.MEDIUM))
    }, [])

    return (
        <div className="App">
            <h1>{price}</h1>
            <button onClick={onQuote}>
                <p>Get Quote</p>
            </button>
        </div>
    )
}

export default App