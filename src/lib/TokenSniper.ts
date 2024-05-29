import TokenSearcher from "./research";
import {constants, WETH} from "./constants";
import DextoolsAPI from "./dextoolsAPI";
import Worksheet from "exceljs/index";
import TokensWatcher from "./watcher";
import {Percent, Token} from "@uniswap/sdk-core";
import {quote} from "./quote";
import getTokenFromAddress from "./tokenInfo";
import {createTrade, executeTrade} from "./trade";
import {ethers} from "ethers";

const dexToolsApi = new DextoolsAPI(constants.api.dextools);

type TokenInfo = {
    token: Token;
    price: string;
}

type TokenCallback = (token: TokenInfo) => void
type IsLoadingCallback = (isLoading: boolean) => void

class TokenSniper {
    chain: string = "ether";
    refreshRate: number = 60 * 4; // in minutes, converted from 60 * 4
    worksheet: Worksheet; // type for sheet, to be defined based on actual use

    tokenSearcher: TokenSearcher = new TokenSearcher(dexToolsApi);
    tokenWatcher: TokensWatcher = new TokensWatcher();

    isRunning: boolean = false;
    tokenCallback: TokenCallback;
    isLoadingCallback: IsLoadingCallback;

    constructor(tokenCallback : TokenCallback, isLoadingCallback: IsLoadingCallback) {
        this.worksheet = this.tokenSearcher.getSheet()
        this.tokenCallback = tokenCallback;
        this.isLoadingCallback = isLoadingCallback;
    }

    public start(): void {
        this.isRunning = true;
        this.main().then(() => console.log("Done"));
    }

    public stop(): void {
        this.isRunning = false;
    }

    async main() {
        const provider = new ethers.JsonRpcProvider(constants.rpc.mainnet);
        const PEPE = await getTokenFromAddress("0x6982508145454ce325ddbe47a25d4ec3d2311933");
        this.tokenWatcher.addToken(PEPE.address);
        const trade = await createTrade("0.0005", PEPE);
        //await executeTrade("0.00005", PEPE, new ethers.Wallet(constants.wallet.privateKey, provider));
        while (this.isRunning) {
            this.isLoadingCallback(true);
            const tokens = await this.tokenSearcher.getTokenList(this.chain, this.refreshRate, 50);
            await this.sleep(1000);
            console.log(`Found ${tokens.length} tokens`);
            for (const token of tokens) {
                const security = await this.tokenSearcher.securityCheck(this.chain, token, false);
                if (security) {
                    this.tokenSearcher.storeToken(this.chain, token, security);


                    this.tokenWatcher.addToken(token.address);
                    getTokenFromAddress(token.address).then(token => {
                        quote(WETH, token).then((price) => {
                            this.tokenCallback({token: token, price: price.toFixed(18)})
                        }).catch(e => {
                            this.tokenCallback({token: token, price: "0"})
                            console.error("Error fetching price", e);
                        });
                    })
                    // this.buyToken(token.address);
                }
            }
            this.isLoadingCallback(false);


            this.tokenWatcher.fetchPrices();
            this.tokenWatcher.calculateEMAs();

            await this.sleep(1000 * 60 * this.refreshRate);
        }
        console.log("Done");
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export {TokenSniper};
export type { TokenInfo };
