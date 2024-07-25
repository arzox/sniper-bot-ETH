import {addHours, subMinutes} from 'date-fns';
import {toZonedTime} from 'date-fns-tz'
import dextoolsAPI from "./dextoolsAPI";
import {isHoneyPot, IsHoneypotData} from "./honeyPotAPI";
import Web3 from 'web3';
import {constants} from "./constants";
import {getTokenFromAddress} from "./tokenInfo";
import {getContractAudit, getLiquidityAudit} from "./defiAPI";
import {Token} from "@uniswap/sdk-core";
import {Transaction} from "ethers";
import {funWithRetry, sleep} from "./utils";


class TokenSearcher {
    private api: dextoolsAPI;
    private web3;
    private subscription: any;
    private tokenProccesing: NodeJS.Timeout | null = null;
    private timeOffset: number = 10;
    private tokenFoundCallback: (token: Token) => void;

    constructor(api: dextoolsAPI, tokenFoundCallback: (token: Token) => void) {
        this.api = api;
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(constants.rpc.wsMainnet2));
        this.tokenFoundCallback = tokenFoundCallback;
    }

    public async start() {
        this.subscription = await this.listenForBlockCreation();
    }

    public stop() {
        this.subscription.unsubscribe();
        if (this.tokenProccesing) clearInterval(this.tokenProccesing);
    }

    public async securityCheck(token: Token, debug: boolean = false): Promise<IsHoneypotData | false> {
        try {
            // Check if the token is a honeypot
            const honeyPot = await funWithRetry(() => {isHoneyPot(token.address)}, 5, 60 * 2);
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
            addHours(subMinutes(now, timeRange + this.timeOffset), 2).toISOString(),
            addHours(subMinutes(now, this.timeOffset), 2).toISOString(),
            0,
            pageSize
        );

        return tokensListResponse.data.tokens;
    }

    private async processTransaction(tx: Transaction) {
        try {
            if (tx && !tx.to) {
                if (tx.hash === null || tx.hash === undefined) return;
                const receipt = await this.web3.eth.getTransactionReceipt(this.web3.utils.hexToBytes(tx.hash));
                const contractAddress = receipt.contractAddress;

                // Check if the new contract is an ERC20 token by calling a known function
                if (contractAddress) {
                    console.log(`New contract address: ${contractAddress}`)
                    const token = await getTokenFromAddress(contractAddress);
                    if (token) {
                        this.tokenFoundCallback(token);
                    }
                }
            }
        } catch (e) {
            console.log("Not a token")
        }
    }

    private async listenForBlockCreation() {
        const subscription = await this.web3.eth.subscribe('newBlockHeaders', (error: Error, blockHeader: any) => {
            if (error) console.error(error);
        });

        subscription.on('data', async (blockHeader: any) => {
            this.web3.eth.getBlock(blockHeader.number, true).then(async (block) => {
                await sleep(1000 * 60 * this.timeOffset);
                if (block.transactions.length === 0) return;
                for (const tx of block.transactions) {
                    // @ts-ignore
                    this.processTransaction(tx);
                }
            });
        });

        return subscription;
    }
}

export default TokenSearcher;
