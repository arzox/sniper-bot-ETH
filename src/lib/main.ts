import TokenSearcher from "./research";
import {constants, WETH} from "./constants";
import DextoolsAPI from "./dextoolsAPI";
import Worksheet from "exceljs/index";
import TokensWatcher from "./watcher";
import {Token} from "@uniswap/sdk-core";
import {quote} from "./quote";
import getTokenFromAddress from "./tokenInfo";

const dexToolsApi = new DextoolsAPI(constants.api.dextools);

type TokenCallback = (token: Token) => void

class TokenSniper {
    chain: string = "ether";
    refreshRate: number = 60 * 3; // in minutes, converted from 60 * 4
    worksheet: Worksheet; // type for sheet, to be defined based on actual use

    tokenSearcher: TokenSearcher = new TokenSearcher(dexToolsApi);
    tokenWatcher: TokensWatcher = new TokensWatcher();

    isRunning: boolean = false;
    tokenCallback: TokenCallback;

    constructor(tokenCallback : TokenCallback) {
        this.worksheet = this.tokenSearcher.getSheet()
        this.tokenCallback = tokenCallback;
    }

    public start(): void {
        this.isRunning = true;
        this.main().then(() => console.log("Done"));

        getTokenFromAddress("0x6982508145454ce325ddbe47a25d4ec3d2311933").then((token) => {
            quote(WETH, token).then((price) => {
                console.log(`Price: ${price}`);
            });
        });
    }

    public stop(): void {
        this.isRunning = false;
    }

    async main() {
        while (this.isRunning) {
            const tokens = await this.tokenSearcher.getTokenList(this.chain, this.refreshRate);
            await this.sleep(1000);
            console.log(`Found ${tokens.length} tokens`);
            for (const token of tokens) {
                const security = await this.tokenSearcher.securityCheck(this.chain, token, false);
                if (security) {
                    console.log(`Token ${token.address} is promising`);
                    this.tokenSearcher.storeToken(this.chain, token, security);

                    this.tokenWatcher.addToken(token.address);
                    this.tokenCallback(token);
                    // this.buyToken(token.address);
                }
                console.log("requesting next token");
            }

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

export default TokenSniper;