import TokenSearcher from "../sol/tokenSearcher";
import {Token} from "@uniswap/sdk-core";


const pepe = "0x6982508145454ce325ddbe47a25d4ec3d2311933"

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function test() {
    const tokenSearcher = new TokenSearcher((signature) => {console.log("Found token: " + signature)});
    tokenSearcher.start();
    await sleep(1000 * 60 * 10)
    await tokenSearcher.stop()
}
