// src/components/TokenDisplay.tsx
import React, { useEffect, useState } from 'react';
import TokenSniper from "../lib/main";
import {Token} from "@uniswap/sdk-core";
import {WETH} from "../lib/constants";

const TokenDisplay: React.FC<{isRunning : boolean}> = ({ isRunning}) => {
    const [tokens, setTokens] = useState<Token[]>([]);

    useEffect(() => {
        setTokens([WETH, WETH])
        function handleNewToken(token: Token) {
            setTokens((prevTokens) => [...prevTokens, token]);
        }

        const tokenSniper = new TokenSniper(handleNewToken);

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
                    </tr>
                </thead>
                <tbody>
                {tokens.length === 0 ? (
                    <tr>
                        <td>Loading tokens...</td>
                    </tr>
                ) : (
                    tokens.map((token, index) => (
                        <tr key={index} className="border-b-2">
                            <td className="py-2 pl-2"><a className="underline decoration-orange-400 decoration-4"
                                   href={"https://www.dextools.io/app/en/ether/pair-explorer/" + token.address}
                                   target="_blank">{token.symbol}</a></td>
                            <td className="py-2 pl-2">{token.address}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

export default TokenDisplay;
