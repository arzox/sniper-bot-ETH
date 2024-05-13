import {ethers, JsonRpcProvider, Contract, getAddress} from "ethers";
import {constants} from "./constants";
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import {Token} from "@uniswap/sdk-core";

const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
    }
];

const getTokenFromAddress = async (address: string) => {
    const provider = new JsonRpcProvider(constants.rpc.mainnet);
    const tokenContract = new Contract(getAddress(address), ERC20_ABI, provider);

    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    return new Token(
        1,
        getAddress(address),
        Number(decimals),
        symbol,
    )
};

export default getTokenFromAddress;