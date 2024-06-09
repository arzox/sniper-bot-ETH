import { createClient } from '@de-fi/sdk'
import {constants} from "./constants";

const client = createClient({
    url: 'https://graphql-sdk-url',
    headers: {
        'X-Api-Key': constants.api.defi
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

export {getContractAudit}