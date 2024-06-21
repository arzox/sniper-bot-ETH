import {ethers, JsonRpcProvider} from 'ethers';
import {constants, WETH} from './constants'
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { Route, Pair, Trade } from '@uniswap/v2-sdk'
import {createPair} from "./quote";
import {FormatTokenPrice} from "../../components/components";

export async function createTrade(amountIn: string, tokenIn: Token, tokenOut: Token): Promise<Trade<Token, Token, TradeType>> {
    const pair = await createPair(tokenIn, tokenOut);

    const route = new Route([pair], tokenIn, tokenOut);
    const amountInBigInt = ethers.parseUnits(amountIn, tokenIn.decimals);
    const trade = new Trade(
        route,
        CurrencyAmount.fromRawAmount(tokenIn, amountInBigInt.toString()),
        TradeType.EXACT_INPUT
    );

    return trade;
}

export async function buyTokenForEth(amountIn: string, tokenOut: Token, wallet: ethers.Wallet){
    try {
        const uniswapV2Router02Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
        const abi = [
            'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
        ];
        const slippageTolerance = new Percent('50', '10000'); // 0.50%

        const trade = await createTrade(amountIn, WETH, tokenOut);
        amountIn = ethers.parseEther(amountIn).toString()
        const amountInHex = ethers.toBeHex(amountIn)
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).numerator.toString();
        const amountOutMinHex = ethers.toBeHex(amountOutMin);
        console.log(amountOutMinHex)
        const path = [WETH.address, tokenOut.address];
        const to = wallet.address;
        const deadline = Math.floor(Date.now() / 1000) + 60; // 20 minutes from the current time

        const uniswapV2Router02 = new ethers.Contract(
            uniswapV2Router02Address, abi, wallet
        );

        const tx = await uniswapV2Router02.swapExactETHForTokens(
            amountOutMinHex,
            path,
            to,
            deadline,
            {value: amountInHex}
        );

        await tx.wait()
        console.log("transaction confirmed")
    } catch(e) {
        console.log(e)
    }
}

export async function sellTokenForEth(amountIn: string, tokenIn: Token, wallet: ethers.Wallet) {
    try {
        const uniswapV2Router02Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
        const abi = [
            'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
        ];
        const slippageTolerance = new Percent('50', '10000'); // 0.50%

        const trade = await createTrade(amountIn, tokenIn, WETH);
        amountIn = ethers.parseUnits(amountIn, tokenIn.decimals).toString()
        const amountInHex = ethers.toBeHex(amountIn)
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).numerator.toString();
        const amountOutMinHex = ethers.toBeHex(amountOutMin);
        console.log(amountOutMinHex)
        const path = [tokenIn.address, WETH.address];
        const to = wallet.address;
        const deadline = Math.floor(Date.now() / 1000) + 60; // 20 minutes from the current time

        const uniswapV2Router02 = new ethers.Contract(
            uniswapV2Router02Address, abi, wallet
        );

        const tx = await uniswapV2Router02.swapExactTokensForETH(
            amountInHex,
            amountOutMinHex,
            path,
            to,
            deadline,
            {value: amountInHex}
        );

        await tx.wait()
        console.log("transaction confirmed")
    } catch(e) {
        console.log(e)
    }
}