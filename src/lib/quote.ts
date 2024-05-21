import { ethers } from 'ethers'
import uniswapV2poolABI from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import {constants, WETH} from './constants'
import { Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Route, Pair, Trade } from '@uniswap/v2-sdk'

async function createPair(tokeIn: Token, tokenOut: Token): Promise<Pair> {
    try {
        const pairAddress = Pair.getAddress(tokeIn, tokenOut)
        // Setup provider, import necessary ABI ...
        const pairContract = new ethers.Contract(pairAddress, JSON.stringify(uniswapV2poolABI.abi), new ethers.JsonRpcProvider(constants.rpc.mainnet))
        const reserves = await pairContract["getReserves"]()
        const [reserve0, reserve1] = reserves

        const tokens = [tokeIn, tokenOut]
        const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]]

        return new Pair(CurrencyAmount.fromRawAmount(token0, reserve0.toString()), CurrencyAmount.fromRawAmount(token1, reserve1.toString()))
    } catch (error) {
        console.log(`Error: ${error}`);
    }
    return Promise.reject("Error in the chain ID ")
}

export async function quote(tokenIn: Token, tokenOut: Token): Promise<number> {

    // To learn how to get Pair data, refer to the previous guide.
    const pair = await createPair(tokenIn, tokenOut)

    const route = new Route([pair], tokenIn, tokenOut)

    const trade = new Trade(route, CurrencyAmount.fromRawAmount(tokenIn, '1000000000000000000'), TradeType.EXACT_INPUT)

    return parseFloat(route.midPrice.invert().toSignificant(2))
}

export async function buyToken(token: Token): Promise<void> {
    const price = await quote(WETH, token)
    console.log(`Price: ${price}`)
}
