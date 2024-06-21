import TokenSearcher from "./research";
import {constants, WETH} from "./constants";
import DextoolsAPI from "./dextoolsAPI";
import TokensWatcher from "./watcher";
import {Token} from "@uniswap/sdk-core";
import {quote} from "./quote";
import {getTokenFromAddress} from "./tokenInfo";
import {IsHoneypotData} from "./honeyPotAPI";

const dexToolsApi = new DextoolsAPI(constants.api.dextools);

type TokenAndPrice = {
    token: Token;
    price: string;
    priceSold: string | null;
}

type TokenCallback = (token: TokenAndPrice) => void
type IsLoadingCallback = (isLoading: boolean) => void
type SoldTokenCallback = (token: Token, priceSold: string) => void

class Main {
    readonly chain: string = "ether";
    readonly refreshRate: number = 1;
    isBuying: boolean = false;

    isRunning: boolean;
    private isDebug: boolean = false;
    private intervalId: NodeJS.Timeout | null;

    tokenCallback: TokenCallback;
    isLoadingCallback: IsLoadingCallback;
    soldTokenCallback: SoldTokenCallback;

    tokenSearcher: TokenSearcher = new TokenSearcher(dexToolsApi);
    tokenWatcher: TokensWatcher = new TokensWatcher("0.005", (token, priceSold) => this.soldTokenCallback(token, priceSold));

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
        //this.tokenSearcher.start();
    }

    public async stop(): Promise<void> {
        this.isRunning = false;
        //this.tokenSearcher.stop();
    }

    async main() {
        if (this.isRunning) {
            this.isLoadingCallback(true);
            const tokens = await this.tokenSearcher.getTokenList(this.chain, this.refreshRate, 50);
            await this.sleep(1000);
            console.log(`Found ${tokens.length} tokens`);
            for (const tokenRaw of tokens) {
                const security = await this.tokenSearcher.securityCheck(this.chain, tokenRaw, this.isDebug);
                if (security) {
                    this.debugToken(security);
                    await this.storeBuyAndCallbackToken(tokenRaw, security);
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

    private debugToken(security: IsHoneypotData) {
        if (this.isDebug) {
            console.log(`Token ${security.token.symbol} is secure\n`
                + `Liquidity: ${security.pair.liquidity}\n`
                + `Risk level: ${security.summary.riskLevel}\n`
                + `Buy tax: ${security.simulationResult.buyTax}\n`
                + `Sell tax: ${security.simulationResult.sellTax}`
            );
        }
    }

    private async storeBuyAndCallbackToken(tokenRaw: any, security: IsHoneypotData) {
        const token = await getTokenFromAddress(tokenRaw.address)
        try {
            const price = await quote(WETH, token);
            this.tokenCallback({token: token, price: price.toFixed(18), priceSold: null})
            await this.tokenWatcher.addToken(token.address)
            if (this.isBuying) this.tokenWatcher.buyToken(token);
        } catch (e) {
            console.error("Error getting the token data", e);
        }
    }

    public setDebug(isDebug: boolean): void {
        this.isDebug = isDebug;
        this.tokenWatcher.isDebug = isDebug
    }

    public setBuying(isBuying: boolean): void {
        this.isBuying = isBuying;
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export {Main};
export type {TokenAndPrice};
