import {JsonRpcProvider, Contract, getAddress} from "ethers";
import {constants} from "./constants";
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

const ERC721_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "tokenURI",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
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

const getTokenURI = async (address: string) => {
    const provider = new JsonRpcProvider(constants.rpc.mainnet);
    const tokenContract = new Contract(getAddress(address), ERC721_ABI, provider);

    return await tokenContract.tokenURI();
}

export default getTokenFromAddress;