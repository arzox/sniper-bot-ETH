import axios from 'axios';
import {Token} from "@uniswap/sdk-core";
import getTokenFromAddress from "./tokenInfo";
import {quote} from "./quote";
import {WETH} from "./constants";
import {FeeAmount} from "@uniswap/v3-sdk";

interface TokenData {
    token: Token;
    prices: number[];
    ema2: number[];
    ema5: number[];
}

class TokensWatcher {
    public tokens: { [address: string]: TokenData };

    constructor() {
        this.tokens = {};
    }

    async addToken(tokenAddress: string): Promise<void> {
        try {
            const token = await getTokenFromAddress(tokenAddress);
            this.tokens[tokenAddress] = { prices: [], ema2: [], ema5: [], token: token }
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
                if (price !== null) {
                    this.tokens[tokenAddress].prices.push(price);
                }
            }
        }
    }

    calculateEMAs(): void {
        for (const token in this.tokens) {
            if (this.tokens[token].prices.length > 0) {
                const currentToken = this.tokens[token];
                const EMA2 = this.calculateEMA(currentToken.prices, currentToken.ema2, 2);
                if (EMA2 !== null) {
                    currentToken.ema2.push(EMA2);
                    console.log(currentToken.ema2, currentToken.ema5);
                }
                const EMA5 = this.calculateEMA(currentToken.prices, currentToken.ema5,  5);
                if (EMA5 !== null) {
                    currentToken.ema5.push(EMA5);
                    console.log(currentToken.ema2, currentToken.ema5);
                }

                if (currentToken.ema5[currentToken.ema5.length - 1] > currentToken.ema2[currentToken.ema2.length - 1]) {
                    this.sellToken(this.tokens[token].token);
                }
            }
        }
    }

    calculateEMA(prices: number[], emas: number[], period: number): number | null{
        const smoothing = 2 / (period + 1);

        if (prices.length <= period){
            return null
        }
        else if (emas.length === 0) {
            return prices.reduce((a, b) => a + b, 0) / period;
        } else {
            const lastEma = emas[emas.length - 1];
            return (prices[prices.length - 1] - lastEma) * smoothing + lastEma;
        }
    }

    sellToken(token: Token): void {
        console.log(`Sell signal for ${token} at ${new Date().toISOString()}`);
        this.clean(token.address);
    }

    buyToken(token: Token): void {
        console.log(`Buy signal for ${token} at ${new Date().toISOString()}`);
    }

    clean(token: string): void {
        delete this.tokens[token];
    }
}

export default TokensWatcher;