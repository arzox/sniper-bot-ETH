import {addHours, subMinutes} from 'date-fns';
import {toZonedTime } from 'date-fns-tz'
import { Workbook, Cell } from 'exceljs';
import dextoolsAPI from "./dextoolsAPI";
import Worksheet from "exceljs/index";
import {isHoneyPot, IsHoneypotData} from "./honeyPotAPI";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {getContractAudit} from "./defiAPI";

interface Token {
    address: string;
    symbol: string;
}

interface Info {
    holders: number;
    mcap: number;
    fdv: number;
}

class TokenSearcher {
    private api: dextoolsAPI;
    private workbook: Workbook;
    private worksheet: Worksheet

    constructor(api: dextoolsAPI) {
        this.api = api;
        this.workbook = new Workbook();
        this.initSheet();
    }

    private initSheet(): void {
        this.worksheet = this.workbook.addWorksheet("Tokens");
        this.worksheet.columns = [
            { header: 'Symbol', key: 'symbol', width: 10 },
            { header: 'Address', key: 'address', width: 32 },
            { header: 'Link', key: 'link', width: 50 },
            { header: 'mcap', key: 'mcap', width: 15 },
            { header: 'fdv', key: 'fdv', width: 15 },
            { header: 'Holders', key: 'holders', width: 10 }
        ];
    }

    public getSheet(): Worksheet {
        return this.worksheet;
    }

    public saveSheet(): void {
        this.workbook.xlsx.writeFile("tokens.xlsx");
    }

    private linkLastCell(ws: any, column: number, address?: string, chain: string = "ether") {
        const cell: Cell = ws.getCell(ws.rowCount, column);
        cell.value = { text: "dexTools link", hyperlink: `https://www.dextools.io/app/en/${chain}/pair-explorer/${address}` };
        cell.style = { font: { color: { argb: 'FF0000FF' }, underline: true } };
    }

    public storeToken(chain: string, token: Token, info: any) {
        this.worksheet.addRow([
            token.symbol, info.address,
            `https://www.dextools.io/app/en/${chain}/pair-explorer/${info.address}`,
            info.mcap, info.fdv, info.holders
        ]);
        this.linkLastCell(this.worksheet, 3, info.address, chain);
    }

    public async securityCheck(chain: string, token: Token, debug: boolean = false): Promise<IsHoneypotData | false> {
        try {
            const honeyPot = await isHoneyPot(token.address);
            const contractAudit = await getContractAudit(token.address);

            // Check contract audit
            const isContractValid = contractAudit && (contractAudit.stats?.scammed === true && (contractAudit.stats?.percentage && contractAudit.stats?.percentage > 5))

            // Check if the token is a honeypot
            const isNotTokenValid = honeyPot.summary["riskLevel"] > 1 || !honeyPot.simulationResult.hasOwnProperty("buyTax")
                || !honeyPot.simulationResult.hasOwnProperty("sellTax") || honeyPot.simulationResult?.buyTax > 5 || honeyPot.simulationResult?.sellTax > 5
                || honeyPot.pair.liquidity < 10000;

            if (!isContractValid) {
                throw Error(`Contract audit failed: ${JSON.stringify(contractAudit, null, 2)}`);
            }
            if (isNotTokenValid) {
                throw Error(`HoneyPot risk level too high: ${JSON.stringify(honeyPot.summary, null, 2)}`);
            }

            return honeyPot;
        } catch (error: any) {
            if (debug) {
                console.error(`Security check failed \n${error}`);
            }
            return false;
        }
    }

    public async getTokenList(chain: string, timeRange: number, pageSize: number = 50): Promise<any> {
        const now = toZonedTime(new Date(), 'UTC');

        const tokensListResponse = await this.api.getTokenList(chain,
            "creationTime",
            "asc",
            addHours(subMinutes(now, timeRange + 5), 2).toISOString(),
            addHours(subMinutes(now, 5), 2).toISOString(),
            0,
            pageSize
        );

        return tokensListResponse.data.tokens;
    }

    private async sleep(number: number) {
        return new Promise(resolve => setTimeout(resolve, number));
    }
}

export default TokenSearcher;
