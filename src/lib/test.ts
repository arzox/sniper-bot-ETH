import {addHours, subMinutes} from 'date-fns';
import {toZonedTime } from 'date-fns-tz'
import TokenSearcher from "./research";
import {constants} from "./constants";
import DEXToolsApi from "./dextoolsAPI";
import TokensWatcher from "./watcher";
import {Token} from "@uniswap/sdk-core";
import {TokenInfo} from "./main";
import getTokenFromAddress from "./tokenInfo";

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function test() {
    // const provider = new ethers.JsonRpcProvider(constants.rpc.mainnet);
    // const PEPE = await getTokenFromAddress("0x6982508145454ce325ddbe47a25d4ec3d2311933");
    // this.tokenWatcher.addToken(PEPE.address);
    // const trade = await createTrade("0.0005", PEPE);
    // await executeTrade("0.00005", PEPE, new ethers.Wallet(constants.wallet.privateKey, provider));


}

type TokenCallback = (token: TokenInfo) => void
type IsLoadingCallback = (isLoading: boolean) => void
type SoldTokenCallback = (token: Token, priceSold: string) => void

class Test {
    tokenCallback: TokenCallback;
    isLoadingCallback: IsLoadingCallback;
    soldTokenCallback: SoldTokenCallback;

    constructor(tokenCallback : TokenCallback, isLoadingCallback: IsLoadingCallback, soldTokenCallback: SoldTokenCallback) {
        this.tokenCallback = tokenCallback;
        this.isLoadingCallback = isLoadingCallback;
        this.soldTokenCallback = soldTokenCallback;

        getTokenFromAddress("0x6982508145454Ce325dDbE47a25d4ec3d2311933").then((token) => {
            tokenCallback({token: token, price: "0.0005", priceSold: null});
            soldTokenCallback(token, "0.00005");
        });

    }
}

export default Test;