import {useCallback, useEffect, useState} from "react";
import {quote} from "./lib/quote";
import {FeeAmount} from "@uniswap/v3-sdk";
import tokenInfo from "./lib/tokenInfo";
import {WETH} from "./lib/constants";
import getTokenFromAddress from "./lib/tokenInfo";

const App = () => {

    const [price, setPrice] = useState("0")
    const [token, setToken] = useState("")

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToken(event.target.value);  // Update the state when the input changes
    };

    const onQuote = useCallback(async () => {
        let tokenSeek = await getTokenFromAddress(token)
        setPrice(await quote(tokenSeek, WETH, FeeAmount.HIGH))
    }, [token])

    return (
        <div className="App">
            <input type="text" onChange={handleChange}/>
            <h1>{price}</h1>
            <button onClick={onQuote}>
                <p>Get Quote</p>
            </button>
        </div>
    )
}

export default App