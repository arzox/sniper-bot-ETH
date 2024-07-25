import {JsonRpcProvider, Contract, getAddress} from "ethers";
import {constants} from "./constants";
import {Token} from "@uniswap/sdk-core";

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

const getTokenFromAddress = async (address: string) => {
    const provider = new JsonRpcProvider(constants.rpc.mainnet2);
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

const getTokenBalance = async (token: Token, address: string) => {
    const provider = new JsonRpcProvider(constants.rpc.mainnet);
    const tokenContract = new Contract(token.address, ERC20_ABI, provider);
    return tokenContract.balanceOf(address);
}

export {getTokenFromAddress, getTokenBalance};