import {FeeAmount} from "@uniswap/v3-sdk";

export const POOL_FACTORY_CONTRACT_ADDRESS =
    '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS =
    '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

export interface Constants {
    POOL_FACTORY_CONTRACT_ADDRESS: string
    QUOTER_CONTRACT_ADDRESS: string
    rpc: {
        mainnet: string
        localhost: string
    }
    api: {
        "dextools": string,
        "oinch": string,
        "uniswap": string
    }
}

export const constants: Constants = {
    POOL_FACTORY_CONTRACT_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    QUOTER_CONTRACT_ADDRESS: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    rpc: {
        mainnet: 'https://mainnet.infura.io/v3/0ac57a06f2994538829c14745750d721',
        localhost: 'http://localhost:8545'
    },
    api: {
        "dextools": "NiPgDIMeP919s4QlpvfU335aC3CxyVE592ig4xnf",
        "oinch": "V047jxydzQHDuKDFMIkAPr72vGltgYfR",
        "uniswap": ""
    },
}

export const WETH = {
    chainId: 1,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether'
}