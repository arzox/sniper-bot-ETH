import {ethers, JsonRpcProvider, Contract, getAddress} from "ethers";
import {constants} from "./constants";
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import {Token} from "@uniswap/sdk-core";

export const getTokenFromAddress = async (address: string) => {
    const provider = new JsonRpcProvider(constants.rpc.mainnet);
    const tokenContract = new Contract(getAddress(address), Quoter.abi, provider);

    return new Token(
        1,
        getAddress(address),
        await tokenContract.decimals(),
        await tokenContract.symbol(),
    )
};