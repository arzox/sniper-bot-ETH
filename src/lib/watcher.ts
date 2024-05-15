import axios from 'axios';
import { create, all } from 'mathjs';
import {Token} from "@uniswap/sdk-core";
import getTokenFromAddress from "./tokenInfo";

const math = create(all);

interface TokenData {
    token: Token;
    prices: number[];
}

class TokensWatcher {
    private tokens: { [address: string]: TokenData };

    constructor() {
        this.tokens = {};
    }

    addToken(tokenAddress: string): void {
        this.tokens[tokenAddress] = { prices: [], token: getTokenFromAddress(tokenAddress) };
    }

    async fetchPrices(): Promise<void> {
        if (Object.keys(this.tokens).length > 0) {
            const tokensPrices = await this.oinchAPI.getPrices(Object.keys(this.tokens));
            console.log(tokensPrices);
            for (const token in tokensPrices) {
                if (tokensPrices.hasOwnProperty(token)) {
                    if (this.tokens[token]) {
                        this.tokens[token].prices.push(tokensPrices[token]);
                    } else {
                        console.log(`Token ${token} not found in the list of tokens`);
                    }
                }
            }
            console.log(JSON.stringify(this.tokens));
        }
    }

    calculateEMAs(): void {
        for (const token in this.tokens) {
            if (this.tokens[token].prices.length > 1) {
                const prices = this.tokens[token].prices;
                const EMA2 = this.calculateEMA(prices, 2);
                const EMA5 = this.calculateEMA(prices, 5);
                if (EMA2 < EMA5) {
                    this.sell(token);
                }
            }
        }
    }

    private calculateEMA(prices: number[], span: number): number {
        // Calculating EMA using mathjs
        const weights = math.exponentialSmooth(prices, 2 / (span + 1));
        return weights[weights.length - 1]; // last value is the latest EMA
    }

    sell(token: string): void {
        console.log(`Sell signal for ${token}`);
    }

    clean(token: string): void {
        delete this.tokens[token];
    }
}
