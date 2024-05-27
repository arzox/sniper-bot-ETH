import { ethers } from 'ethers';
import {constants, WETH} from './constants'
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { Route, Pair, Trade } from '@uniswap/v2-sdk'

async function createTrade(amountIn: string) {
    const { DAI, WETH } = await getTokenData();
    const pair = await Fetcher.fetchPairData(DAI, WETH, provider);

    const route = new Route([pair], WETH);
    const amountInWei = ethers.parseUnits(amountIn, DAI.decimals);
    const trade = new Trade(
        route,
        new TokenAmount(WETH, amountInWei.toString()),
        TradeType.EXACT_INPUT
    );

    return trade;
}

async function executeTrade(amountIn: string, trade: Trade<Token, Token, TradeType>) {
    const uniswapV2Router02Address = '0x7a250d5630b4cf539739df2c5dacab1b98bcb6b6';
    const slippageTolerance = new Percent('50', '10000'); // 0.50%

    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();
    const path = [trade.inputAmount.currency.address, trade.outputAmount.currency.address];
    const to = constants.wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current time
    const value = trade.inputAmount.toString(); // needs to be in raw format

    const uniswapV2Router02 = new ethers.Contract(
        uniswapV2Router02Address,
        [
            'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
        ],
        wallet
    );

    const tx = await uniswapV2Router02.swapExactETHForTokens(
        ethers.parseUnits(amountOutMin, 18),
        path,
        to,
        deadline,
        { value: ethers.parseUnits(amountIn, 18) }
    );

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log(`Transaction confirmed in block ${tx.blockNumber}`);
}

// Execute trade with specified amount of ETH
executeTrade('0.1').catch(console.error);
