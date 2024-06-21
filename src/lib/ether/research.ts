import {addHours, subMinutes} from 'date-fns';
import {toZonedTime} from 'date-fns-tz'
import dextoolsAPI from "./dextoolsAPI";
import {isHoneyPot, IsHoneypotData} from "./honeyPotAPI";
import Web3 from 'web3';
import {constants} from "./constants";
import {getTokenFromAddress} from "./tokenInfo";
import {getContractAudit, getLiquidityAudit} from "./defiAPI";


interface Token {
    address: string;
    symbol: string;
}

class TokenSearcher {
    private api: dextoolsAPI;
    private web3;
    private txQueue: string[];
    private subscription: any;
    private tokenProccesing: NodeJS.Timeout | null = null;

    constructor(api: dextoolsAPI) {
        this.api = api;
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(constants.rpc.wsMainnet));
        this.txQueue = [];
    }

    public async start() {
        this.subscription = await this.listenForTokenCreation();
        await this.sleep(500);

        this.tokenProccesing = setInterval(() => {
            this.processToken();
        }, 500);
    }

    public stop() {
        this.subscription.unsubscribe();
        if (this.tokenProccesing) clearInterval(this.tokenProccesing);
    }

    public async securityCheck(chain: string, token: Token, debug: boolean = false): Promise<IsHoneypotData | false> {
        try {
            // Check if the token is a honeypot
            const honeyPot = await isHoneyPot(token.address);
            const isNotTokenValid = honeyPot.summary["riskLevel"] > 1 || !honeyPot.simulationResult.hasOwnProperty("buyTax")
                || !honeyPot.simulationResult.hasOwnProperty("sellTax") || honeyPot.simulationResult?.buyTax > 5 || honeyPot.simulationResult?.sellTax > 5
                || honeyPot.pair.liquidity < 10000;

            if (isNotTokenValid) {
                throw Error(`HoneyPot risk level too high: ${JSON.stringify(honeyPot.summary, null, 2)}\n
                ${token.address}`);
            }

            // liquidity check
            const liquidityAudit = await getLiquidityAudit(token.address);
            const isLiquidityValid = liquidityAudit && (liquidityAudit.isEnoughLiquidityLocked === true)

            if (!isLiquidityValid) {
                throw Error(`${token.symbol} Liquidity audit failed: ${JSON.stringify(liquidityAudit, null, 2)}`);
            }

            // contract validity check
            const contractAudit = await getContractAudit(token.address);
            const isContractValid = contractAudit && (contractAudit.stats?.scammed === false && (contractAudit.stats?.percentage && contractAudit.stats?.percentage >= 50))

            if (!isContractValid) {
                throw Error(`${token.symbol} Contract audit failed: ${JSON.stringify(contractAudit, null, 2)}`);
            }

            return honeyPot;
        } catch (error: any) {
            if (debug) {
                console.error(`Security check failed \n${error}`);
            }
            return false;
        }
    }

    public async getTokenList(chain: string, timeRange: number, pageSize: number = 50): Promise<any> {
        const now = toZonedTime(new Date(), 'UTC');

        const tokensListResponse = await this.api.getTokenList(chain,
            "creationTime",
            "asc",
            addHours(subMinutes(now, timeRange + 5), 2).toISOString(),
            addHours(subMinutes(now, 5), 2).toISOString(),
            0,
            pageSize
        );

        return tokensListResponse.data.tokens;
    }

    private async sleep(number: number) {
        return new Promise(resolve => setTimeout(resolve, number));
    }

    private async listenForTokenCreation(): Promise<any> {
        // Subscribe to pending transactions
        const subscription = await this.web3.eth.subscribe('pendingTransactions', (error: Error, txHash: string) => {
            if (error) console.error(error);
        });

        subscription.on('data', (txHash: string) => {
            this.txQueue.push(txHash);
        });

        return subscription
    }

    private getLastHash() {
        let txHash = null;
        do {
            txHash = this.txQueue.pop();
        } while (txHash === null || txHash === undefined);
        return txHash;
    }

    private async getTransactionWithRetry(txHash: string, retries = 10, delayMs = 4000): Promise<any> {
        for (let i = 0; i < retries; i++) {
            try {
                const tx = await this.web3.eth.getTransaction(this.web3.utils.hexToBytes(txHash));
                if (tx) {
                    return tx;
                }
            } catch (error) {}
            await this.sleep(delayMs);
        }
    }

    private async processToken() {
        let txHash = this.getLastHash();
        try {
            const tx = await this.getTransactionWithRetry(txHash);

            // If the transaction has no to address, it's a contract creation
            if (tx && !tx.to) {
                console.log(`New contract creation: ${txHash}`)
                const receipt = await this.web3.eth.getTransactionReceipt(txHash);
                const contractAddress = receipt.contractAddress;

                // Check if the new contract is an ERC20 token by calling a known function
                if (contractAddress) {
                    // It's an ERC20 token
                    console.log(`New token created: ${JSON.stringify(await getTokenFromAddress(contractAddress))}`)
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

export default TokenSearcher;
