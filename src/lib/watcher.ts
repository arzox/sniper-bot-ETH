import axios from 'axios';
import {Token} from "@uniswap/sdk-core";
import getTokenFromAddress from "./tokenInfo";
import {quote} from "./quote";
import {WETH} from "./constants";
import {FeeAmount} from "@uniswap/v3-sdk";

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
        getTokenFromAddress(tokenAddress).then(value =>
            this.tokens[tokenAddress] = { prices: [], token: value }).catch(
                e => console.error("Error adding token", e)
        );
    }

    fetchPrices(): void {
        if (Object.keys(this.tokens).length > 0) {
            for (const [tokenAddress, tokenInfo] of Object.entries(this.tokens)) {
                quote(tokenInfo.token, WETH, FeeAmount.HIGH).then(tokensPrice => {
                    console.log(`Price for ${tokenAddress}: ${tokensPrice}`);
                    this.tokens[tokenAddress].prices.push(Number(tokensPrice));
                }).catch(e => console.error("Error fetching prices", e));
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

    calculateEMA(prices: number[], period: number): number {
        const smoothing = 2;
        let ema = prices[0]; // starting with the first price as the initial EMA

        for (let price of prices) {
            ema = (price * (smoothing / (1 + period))) + (ema * (1 - (smoothing / (1 + period))));
        }

        return ema;
    }

    sell(token: string): void {
        console.log(`Sell signal for ${token}`);
        this.clean(token);
    }

    clean(token: string): void {
        delete this.tokens[token];
    }
}

export default TokensWatcher;