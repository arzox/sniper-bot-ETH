import { ethers } from 'ethers'
import { computePoolAddress } from '@uniswap/v3-sdk'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import {
    constants,
} from './constants'
import { toReadableAmount, fromReadableAmount } from './conversion'
import {Token} from "@uniswap/sdk-core";

export async function quote(tokenIn: Token, tokenOut: Token, fee: number): Promise<BigInt> {
    const quoterContract = new ethers.Contract(
        constants.QUOTER_CONTRACT_ADDRESS,
        Quoter.abi,
        new ethers.JsonRpcProvider(constants.rpc.mainnet)
    )
    const poolConstants = await getPoolConstants(tokenIn, tokenOut, fee)
    const quotedAmountOut =
        await quoterContract.quoteExactInputSingle.staticCall(
            poolConstants.token0,
            poolConstants.token1,
            poolConstants.fee,
            fromReadableAmount(
                1,
                tokenIn.decimals
            ).toString(),
            0
        )

    // console.log(quotedAmountOut * BigInt(poolConstants.liquidity) / BigInt(1e18) / BigInt(2900));
    return quotedAmountOut / BigInt(10 ** tokenOut.decimals)
}

async function getPoolConstants(tokenIn: Token, tokenOut: Token, fee: number): Promise<{
    token0: string
    token1: string
    fee: number
    liquidity: number
}> {
    const currentPoolAddress = computePoolAddress({
        factoryAddress: constants.POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: tokenIn,
        tokenB: tokenOut,
        fee: fee,
    })

    const poolContract = new ethers.Contract(
        currentPoolAddress,
        IUniswapV3PoolABI.abi,
        new ethers.JsonRpcProvider(constants.rpc.mainnet)
    )
    const [token0, token1, feeFound, liquidity] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.liquidity()
    ])


    return {
        token0,
        token1,
        fee,
        liquidity
    }
}
