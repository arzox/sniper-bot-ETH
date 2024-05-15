import TokenSearcher from "./research";
import {constants} from "./constants";
import DextoolsAPI from "./dextoolsAPI";
import Worksheet from "exceljs/index";
import TokensWatcher from "./watcher";

const dexToolsApi = new DextoolsAPI(constants.api.dextools);

class TokenSniper {
    chain: string = "ether";
    refreshRate: number = 60 * 3; // in minutes, converted from 60 * 4
    worksheet: Worksheet; // type for sheet, to be defined based on actual use

    tokenSearcher: TokenSearcher = new TokenSearcher(dexToolsApi);
    tokenWatcher: TokensWatcher = new TokensWatcher();

    isRunning: boolean = false;

    constructor() {
        this.worksheet = this.tokenSearcher.getSheet()
    }

    public start(): void {
        this.isRunning = true;
        this.main().then(() => console.log("Done"));
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