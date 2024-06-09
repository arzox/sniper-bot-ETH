import {Token} from "@uniswap/sdk-core";
import {getTokenFromAddress, getTokenBalance} from "./tokenInfo";
import {quote} from "./quote";
import {constants, WETH} from "./constants";
import {buyTokenForEth, sellTokenForEth} from "./trade";
import {ethers, Wallet} from "ethers";
import {isHoneyPot} from "./honeyPotAPI";

interface TokenData {
    token: Token;
    prices: number[];
    ema2: number[];
    ema5: number[];
}

type SoldTokenCallback = (token: Token, priceSold: string) => void

class TokensWatcher {
    public tokens: { [address: string]: TokenData };
    private soldTokenCallback: SoldTokenCallback;
    private amountIn: string;
    private provider = new ethers.JsonRpcProvider(constants.rpc.mainnet);
    private wallet = new Wallet(constants.wallet.privateKey, this.provider);

    private _isDebug: boolean = false;

    constructor(amountIn: string, soldTokenCallback: SoldTokenCallback) {
        this.soldTokenCallback = soldTokenCallback;
        this.tokens = {};
        this.amountIn = amountIn;
    }

    async addToken(tokenAddress: string): Promise<void> {
        try {
            const token = await getTokenFromAddress(tokenAddress);
            this.tokens[token.address] = { prices: [], ema2: [], ema5: [], token: token }
        } catch (e) {
            console.error("Error adding token", e);
        }
    }

    private async fetchTokenPrice(tokenInfo: TokenData): Promise<number | null> {
        try {
            return await quote(WETH, tokenInfo.token);
        } catch (e) {
            console.error("Error fetching price", e);
            return null;
        }
    }

    async fetchPrices(): Promise<void> {
        if (Object.keys(this.tokens).length > 0) {
            for (const [tokenAddress, tokenInfo] of Object.entries(this.tokens)) {
                const price = await this.fetchTokenPrice(tokenInfo);
                let prices = this.tokens[tokenAddress].prices;
                if (price !== null) {
                    prices.push(price);
                }

                if (price === prices[prices.length - 1]) {
                    const isDump =  await this.isTokenDump(tokenInfo.token);
                    if (isDump) {
                        this.soldTokenCallback(tokenInfo.token, "0");
                        this.clean(tokenAddress);
                    }
                }
            }
        }
    }

    async isTokenDump(token: Token): Promise<boolean> {
        const isHoneypot = await isHoneyPot(token.address);
        if (isHoneypot.pair.liquidity < 100) {
            return true;
        }
        if (isHoneypot.summary.riskLevel > 60 && this.isDebug) {
            console.log(`${token.symbol} Risk level too high: ${isHoneypot.summary.riskLevel}`);
        }
        return false
    }

    calculateEMAs(): void {
        for (const token in this.tokens) {
            if (this.tokens[token].prices.length > 0) {
                const currentToken = this.tokens[token];
                const EMA2 = this.calculateEMA(currentToken.prices, currentToken.ema2, 2);
                if (EMA2 !== null) {
                    currentToken.ema2.push(EMA2);
                }
                const EMA5 = this.calculateEMA(currentToken.prices, currentToken.ema5,  5);
                if (EMA5 !== null) {
                    currentToken.ema5.push(EMA5);
                }

                if (currentToken.ema5[currentToken.ema5.length - 1] > currentToken.ema2[currentToken.ema2.length - 1]) {
                    this.sellToken(this.tokens[token].token);
                }

                if (this._isDebug) {
                    console.log(`Token: ${token}\nPrices: ${currentToken.prices}`)
                }
            }
        }
    }

    calculateEMA(prices: number[], emas: number[], period: number): number | null{
        const smoothing = 2 / (period + 1);

        if (prices.length < period){
            return null
        }
        else if (emas.length === 0) {
            return prices.reduce((a, b) => a + b, 0) / period;
        } else {
            const lastEma = emas[emas.length - 1];
            return (prices[prices.length - 1] - lastEma) * smoothing + lastEma;
        }
    }

    async sellToken(token: Token): Promise<void> {
        const balance = await getTokenBalance(token, this.wallet.address);
        try {
            await sellTokenForEth(ethers.formatUnits(balance.toString(), token.decimals).toString(), token, this.wallet);
            const price = await quote(WETH, token);
            console.log(`Price: ${price}`)
            this.soldTokenCallback(token, price.toFixed(18));
            console.log(`Sell signal for ${token.symbol} at ${new Date().toISOString()}`);
            this.clean(token.address);
        } catch (e) {
            console.error("Error fetching price", e);
            this.soldTokenCallback(token, "0");
        }
    }

    buyToken(token: Token): void {
        buyTokenForEth(this.amountIn, token, this.wallet).then(() => {
            console.log(`Buy signal for ${token.symbol} at ${new Date().toISOString()}`);
        }).catch((e) => {
            console.error("Error buying token", e);
        });
    }

    clean(token: string): void {
        delete this.tokens[token]
    }


    set isDebug(value: boolean) {
        this._isDebug = value;
    }
}

// @ts-ignore
export default TokensWatcher;