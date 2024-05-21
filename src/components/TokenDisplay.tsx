import React, {useEffect, useState} from 'react';
import {TokenSniper, TokenInfo} from "../lib/TokenSniper";
import {WETH} from "../lib/constants";
import {FormatTokenPrice} from "./components";


const TokenDisplay: React.FC<{ isRunning: boolean }> = ({isRunning}) => {
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        //setTokens([WETH, WETH], [0, 0])

        function handleNewToken(token: TokenInfo) {
            setTokens((prevTokens) => [...prevTokens, token]);
        }

        function handeLoading(isLoading: boolean) {
            setIsLoading(isLoading)
        }

        const tokenSniper = new TokenSniper(handleNewToken, handeLoading);

        if (isRunning) {
            tokenSniper.start();
        } else {
            tokenSniper.stop();
        }
    }, [isRunning]);


    return (
        <div className="flex flex-col items-center justify-center w-1/2">
            <table className="w-full">
                <thead className="bg-orange-500 rounded-lg text-sky-50 h-10">
                <tr className="text-left">
                    <th className="pl-2">Symbol</th>
                    <th className="pl-2">Address</th>
                    <th className="pl-2">Price</th>
                </tr>
                </thead>
                <tbody>
                {tokens.length === 0 && !isLoading ? (
                    <tr>
                        <td>No tokens Fetch</td>
                    </tr>
                ) : (
                    <>
                        {tokens.map((tokenInfo, index) => (
                            <tr key={index} className="border-b-2">
                                <td className="py-2 pl-2"><a className="underline decoration-orange-400 decoration-4"
                                                             href={`https://birdeye.so/token/${tokenInfo.token.address}?chain=ethereum`}
                                                             // href={"https://www.dextools.io/app/en/ether/pair-explorer/" + token.address}
                                                             target="_blank">{tokenInfo.token.symbol}</a></td>
                                <td className="py-2 pl-2">{tokenInfo.token.address}</td>
                                <td>${FormatTokenPrice(tokenInfo.price)}</td>
                            </tr>
                        ))}
                        {isLoading && (
                            <tr>
                                <td>Loading tokens...</td>
                            </tr>
                        )}
                    </>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default TokenDisplay;
