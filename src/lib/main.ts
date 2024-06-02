import TokenSearcher from "./research";
import {constants, WETH} from "./constants";
import DextoolsAPI from "./dextoolsAPI";
import Worksheet from "exceljs/index";
import TokensWatcher from "./watcher";
import {Token} from "@uniswap/sdk-core";
import {quote} from "./quote";
import getTokenFromAddress from "./tokenInfo";

const dexToolsApi = new DextoolsAPI(constants.api.dextools);

type TokenInfo = {
    token: Token;
    price: string;
    priceSold: string | null;
}

type TokenCallback = (token: TokenInfo) => void
type IsLoadingCallback = (isLoading: boolean) => void
type SoldTokenCallback = (token: Token, priceSold: string) => void

class Main {
    chain: string = "ether";
    refreshRate: number = 1;
    worksheet: Worksheet; // type for sheet, to be defined based on actual use

    tokenSearcher: TokenSearcher = new TokenSearcher(dexToolsApi);
    tokenWatcher: TokensWatcher = new TokensWatcher((token, priceSold) => this.soldTokenCallback(token, priceSold));

    isRunning: boolean = false;
    tokenCallback: TokenCallback;
    isLoadingCallback: IsLoadingCallback;
    soldTokenCallback: SoldTokenCallback;

    constructor(tokenCallback : TokenCallback, isLoadingCallback: IsLoadingCallback, soldTokenCallback: SoldTokenCallback) {
        this.worksheet = this.tokenSearcher.getSheet()
        this.tokenCallback = tokenCallback;
        this.isLoadingCallback = isLoadingCallback;
        this.soldTokenCallback = soldTokenCallback;
    }

    public start(): void {
        this.isRunning = true;
        this.main().then(() => console.log("Done"));
    }

    public stop(): void {
        this.isRunning = false;
    }

    async main() {
        while (this.isRunning || Object.keys(this.tokenWatcher.tokens).length > 0) {
            const now = new Date();
            if (this.isRunning) {
                this.isLoadingCallback(true);
                const tokens = await this.tokenSearcher.getTokenList(this.chain, this.refreshRate, 50);
                await this.sleep(1000);
                console.log(`Found ${tokens.length} tokens`);
                for (const token of tokens) {
                    const security = await this.tokenSearcher.securityCheck(this.chain, token, false);
                    if (true) {
                        this.tokenSearcher.storeToken(this.chain, token, security);
                        const tokenEther = await getTokenFromAddress(token.address)
                        try {
                            const price = await quote(WETH, tokenEther);
                            this.tokenCallback({token: token, price: price.toFixed(18), priceSold: null})
                            await this.tokenWatcher.addToken(token.address)
                            this.tokenWatcher.buyToken(token);
                        } catch (e) {
                            console.error("Error getting the token data", e);
                        }
                    }
                }
                this.isLoadingCallback(false);
            }

            await this.tokenWatcher.fetchPrices();
            this.tokenWatcher.calculateEMAs();

            await this.sleep(now.getTime() + this.refreshRate * 1000 * 60 - new Date().getTime());
        }
        console.log("Done");
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export {Main};
export type { TokenInfo };
