import {Token} from "@uniswap/sdk-core";
import {Connection, PublicKey} from "@solana/web3.js"
import {constants} from "./constants";

type TokenFoundCallback = (signature: string) => void;

class TokenSearcher {
    private tokenFoundCallback;
    private connection;
    private raydium
    private listener: number | null = null

    constructor(tokenFoundCall: TokenFoundCallback) {
        this.tokenFoundCallback = tokenFoundCall;
        this.raydium = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

        const SESSION_HASH = 'QNDEMO' + Math.ceil(Math.random() * 1e9);
        this.connection = new Connection(constants.rpc.http, {wsEndpoint: constants.rpc.wss, httpHeaders: {"x-session-hash": SESSION_HASH}});
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public start() {
        this.listener = this.connection.onLogs(this.raydium,
            ({logs, err, signature}) => {
                this.processToken(logs, err, signature)
            });
        console.log("Started")
    }

    public async stop() {
        if (this.listener != null) {
            await this.connection.removeOnLogsListener(this.listener);
            console.log("Stopped")
        }
    }

    private processToken(logs: string[], err: any | null, signature: string) {
        if (err) return;
        if (logs.some(log => log.includes("initializeMint"))) {
            console.log("Found token")
            this.tokenFoundCallback(signature)
        }
    }
}

export default TokenSearcher;