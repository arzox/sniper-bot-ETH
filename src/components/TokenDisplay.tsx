import React, {useEffect, useRef, useState} from 'react';
import {Main, TokenInfo} from "../lib/main";
import {WETH} from "../lib/constants";
import {FormatTokenPrice} from "./components";
import {Token} from "@uniswap/sdk-core";
import {getTokenFromAddress} from "../lib/tokenInfo";

type TokenDisplayProps = {
    isRunning: boolean;
    isDebubg: boolean;
    isBuying: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({isRunning, isDebubg, isBuying}) => {
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const tokenSniper = useRef<Main | null>(null);

    useEffect(() => {
        //setTokens([WETH, WETH], [0, 0])

        function handleToken(token: TokenInfo) {
            setTokens((prevTokens) => {
                return [...prevTokens, token];
            });
        }

        function handleLoading(isLoading: boolean) {
            setIsLoading(isLoading)
        }

        function soldToken(token: Token, priceSold: string) {
            setTokens((prevTokens) => {
                return prevTokens.map((tokenInfo) => {
                    if (tokenInfo.token.address === token.address) {
                        return {...tokenInfo, priceSold: priceSold};
                    } else {
                        return tokenInfo;
                    }
                });
            });
        }

        if (!tokenSniper.current) {
            tokenSniper.current = new Main(handleToken, handleLoading, soldToken);
        }

        if (isRunning && tokenSniper) {
            tokenSniper.current.start();
        } else if (tokenSniper && tokenSniper.current.isRunning) {
            tokenSniper.current.stop();
        }
    }, [isRunning, tokenSniper]);

    useEffect(() => {
        if (tokenSniper.current) {
            tokenSniper.current.setDebug(isDebubg);
        }

        if (tokenSniper.current) {
            tokenSniper.current.setBuying(isBuying);
        }
    }, [isDebubg, isBuying, tokenSniper]);


    function getGain(tokenInfo: TokenInfo) {
        // @ts-ignore
        return parseFloat(tokenInfo.priceSold) / parseFloat(tokenInfo.price) * 100;
    }

    return (
        <div className="flex flex-col items-center justify-center w-2/3">
            <table className="w-full">
                <thead className="bg-orange-500 rounded-lg text-sky-50 h-10">
                <tr className="text-left">
                    <th className="pl-2">Symbol</th>
                    <th className="pl-2">Address</th>
                    <th className="pl-2">Price</th>
                    <th className="text-center">Sold</th>
                </tr>
                </thead>
                <tbody>
                {tokens.length === 0 && !isLoading ? (
                    <tr>
                        <td>No token fetch</td>
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
                                <td className="pl-2">${FormatTokenPrice(tokenInfo.price)}</td>
                                <td className="text-center">{tokenInfo.priceSold == null ? "❌" : <p className={(getGain(tokenInfo) >= 100 ? "text-green-500" : "text-red-500") + " font-bold"}>{getGain(tokenInfo).toString()}%</p>}</td>
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
