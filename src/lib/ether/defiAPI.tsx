import { createClient } from '@de-fi/sdk'
import {constants} from "./constants";
import axios from "axios"

const client = createClient({
    fetcherMethod: async (operation) => {
        const instance = axios.create({
            timeout: 10000,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Api-Key': constants.api.defi2,
            }
        })
        const response = await instance.post("https://public-api.de.fi/graphql",
           JSON.stringify(operation)
        );
        return await response.data;
    }
});

const getContractAudit = async (tokenAddress: string) => {
    const query = await client.query({
        scannerProject: [{where: {address: tokenAddress, chainId: 1}},
            {
                stats: {
                    scammed: true,
                    percentage: true,
                    critical: true,
                },
                name: true,
            }
        ]
    });
    return query.data?.scannerProject;
}

const getLiquidityAudit = async (tokenAddress: string) => {
    const query = await client.query({
        scannerLiquidityAnalysis: [{where: {address: tokenAddress, chainId: 1}},
            {
                isEnoughLiquidityLocked: true,
                issues: {
                    scwTitle: true,
                }
            }
        ],
    });
    return query.data?.scannerLiquidityAnalysis;
}

export {getContractAudit, getLiquidityAudit}