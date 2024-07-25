import {Token} from "@uniswap/sdk-core";

export const POOL_FACTORY_CONTRACT_ADDRESS =
    '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS =
    '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

export interface Constants {
    POOL_FACTORY_CONTRACT_ADDRESS: string
    QUOTER_CONTRACT_ADDRESS: string
    rpc: {
        mainnet: string
        mainnet2: string
        wsMainnet: string
        wsMainnet2: string
        linea: string
        localhost: string
    }
    api: {
        dextools: string,
        defi: string,
        defi2: string,
        etherscan: string
    },
    wallet: {
        address: string,
        privateKey: string
    },
}

export const constants: Constants = {
    POOL_FACTORY_CONTRACT_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    QUOTER_CONTRACT_ADDRESS: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    rpc: {
        mainnet: 'https://mainnet.infura.io/v3/6f6bea5d8f9348efb32c78d9a7d0d46c',
        mainnet2: 'https://mainnet.infura.io/v3/084547bd54d443d5bf489e0e12472746',
        wsMainnet: 'wss://mainnet.infura.io/ws/v3/6f6bea5d8f9348efb32c78d9a7d0d46c',
        wsMainnet2: 'wss://mainnet.infura.io/ws/v3/084547bd54d443d5bf489e0e12472746',
        linea: 'https://linea-mainnet.infura.io/v3/6f6bea5d8f9348efb32c78d9a7d0d46c',
        localhost: 'http://localhost:8545' 
    },
    api: {
        dextools: "NiPgDIMeP919s4QlpvfU335aC3CxyVE592ig4xnf",
        defi: "a78bee61bb84408eb68a5cc2b90c6edb",
        defi2: "da676c51a3c5483cbf6af4116ce4dda2",
        etherscan: "S9FJYI8GMHG413XZB7NN96D7RRDXMZNCNS"
    },
    wallet: {
        address: "0xb709C27C02d0cCb7Ed41520aD3f817e248C07E92",
        privateKey: "14b8b5dcd33ec0e8109d1e23f2ae1529d26c800e9db2fa3d179892984159044d"
    },
}

export const WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');