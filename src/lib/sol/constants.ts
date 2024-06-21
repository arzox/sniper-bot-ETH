export interface Constants {
    SWAP_CONTRACT_ADDRESS: string
    rpc: {
        raydium: string
        http: string
        wss: string
    }
    api: {
    },
    wallet: {
        address: string,
        privateKey: string
    },
}

export const constants: Constants = {
    SWAP_CONTRACT_ADDRESS: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
    rpc: {
        raydium: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        http: 'https://magical-empty-haze.solana-mainnet.quiknode.pro/4f10fc79a105066fcca01ca6b14f9027f40fc3dc/',
        wss: 'wss://magical-empty-haze.solana-mainnet.quiknode.pro/4f10fc79a105066fcca01ca6b14f9027f40fc3dc/',
    },
    api: {

    },
    wallet: {
        address: "0xb709C27C02d0cCb7Ed41520aD3f817e248C07E92",
        privateKey: "14b8b5dcd33ec0e8109d1e23f2ae1529d26c800e9db2fa3d179892984159044d"
    },
}