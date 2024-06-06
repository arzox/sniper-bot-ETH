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
    isRunning: boolean;
    tokenCallback: TokenCallback;
    isLoadingCallback: IsLoadingCallback;
    soldTokenCallback: SoldTokenCallback;

    tokenSearcher: TokenSearcher = new TokenSearcher(dexToolsApi);
    tokenWatcher: TokensWatcher = new TokensWatcher((token, priceSold) => this.soldTokenCallback(token, priceSold));

    private intervalId: NodeJS.Timeout | null;

    constructor(tokenCallback: TokenCallback, isLoadingCallback: IsLoadingCallback, soldTokenCallback: SoldTokenCallback) {
        this.tokenCallback = tokenCallback;
        this.isLoadingCallback = isLoadingCallback;
        this.soldTokenCallback = soldTokenCallback;

        this.isRunning = false
        this.intervalId = null;
    }

    public start(): void {
        this.isRunning = true;
        this.main()
        this.intervalId = setInterval(() => {
            this.main();
        }, this.refreshRate * 1000 * 60); // Run task every refreshRate minutes
    }

    public async stop(): Promise<void> {
        this.isRunning = false;
    }

    async main() {
        if (this.isRunning) {
            this.isLoadingCallback(true);
            const tokens = await this.tokenSearcher.getTokenList(this.chain, this.refreshRate, 50);
            await this.sleep(1000);
            console.log(`Found ${tokens.length} tokens`);
            for (const tokenRaw of tokens) {
                const security = await this.tokenSearcher.securityCheck(this.chain, tokenRaw, true);
                if (security) {
                    const token = await getTokenFromAddress(tokenRaw.address)
                    this.tokenSearcher.storeToken(this.chain, tokenRaw, security);
                    try {
                        const price = await quote(WETH, token);
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
        const isTokenRemaining = Object.keys(this.tokenWatcher.tokens).length > 0;
        if (!isTokenRemaining && !this.isRunning && this.intervalId) {
            clearInterval(this.intervalId);
            console.log("Done")
        }
        await this.tokenWatcher.fetchPrices();
        this.tokenWatcher.calculateEMAs();
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export {Main};
export type {TokenInfo};
