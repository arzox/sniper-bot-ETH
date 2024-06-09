import axios from "axios";

const url = "https://api.honeypot.is/v2/"

type IsHoneypotData = {
    token: {
        name: string;
        symbol: string;
        decimals: number;
        address: string;
        totalHolders: number;
    };
    withToken: {
        name: string;
        symbol: string;
        decimals: number;
        address: string;
        totalHolders: number;
    };
    summary: {
        risk: string;
        riskLevel: number;
    };
    simulationSuccess: boolean;
    honeypotResult: {
        isHoneypot: boolean;
    };
    simulationResult: {
        maxBuy: {
            token: number;
            tokenWei: string;
            withToken: number;
            withTokenWei: string;
        };
        maxSell: {
            token: number;
            tokenWei: string;
            withToken: number;
            withTokenWei: string;
        };
        buyTax: number;
        sellTax: number;
        transferTax: number;
        buyGas: string;
        sellGas: string;
    };
    holderAnalysis: {
        holders: string;
        successful: string;
        failed: string;
        siphoned: string;
        averageTax: number;
        averageGas: number;
        highestTax: number;
        highTaxWallets: string;
        taxDistribution: Array<{
            tax: number;
            count: number;
        }>;
    };
    flags: string[];
    contractCode: {
        openSource: boolean;
        rootOpenSource: boolean;
        isProxy: boolean;
        hasProxyCalls: boolean;
    };
    chain: {
        id: string;
        name: string;
        shortName: string;
        currency: string;
    };
    router: string;
    pair: {
        pair: {
            name: string;
            address: string;
            token0: string;
            token1: string;
            type: string;
        };
        chainId: string;
        reserves0: string;
        reserves1: string;
        liquidity: number;
        router: string;
        createdAtTimestamp: string;
        creationTxHash: string;
    };
    pairAddress: string;
};

async function makeRequest(endpoint: string, address: string): Promise<any> {
    try {
        const config = {
            timeout: 10000,
            params: {
                address: address
            }
        }
        const response = await axios.get(url + endpoint, config)
        return response.data
    } catch (error) {
        throw error
    }
}

async function isHoneyPot(address: string): Promise<IsHoneypotData> {
    return await makeRequest("IsHoneypot", address)
}

export {isHoneyPot}
