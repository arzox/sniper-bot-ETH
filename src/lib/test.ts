import {addHours, subMinutes} from 'date-fns';
import {toZonedTime } from 'date-fns-tz'
import TokenSearcher from "./research";
import {constants} from "./constants";
import DEXToolsApi from "./dextoolsAPI";
import TokensWatcher from "./watcher";

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