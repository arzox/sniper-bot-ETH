import {addHours, formatISO, subHours, subMinutes} from 'date-fns';
import {toZonedTime } from 'date-fns-tz'
import { Workbook, Cell } from 'exceljs';
import dextoolsAPI from "./dextoolsAPI";
import Worksheet from "exceljs/index";

interface Token {
    address: string;
    symbol: string;
}

interface Audit {
    isPotentiallyScam: string;
    isHoneypot: string;
    isContractRenounced: string;
    sellTax: { max: number };
    buyTax: { max: number };
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
    private isRunning: boolean = false;

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

    public start(): void {
        this.isRunning = true;
        console.log(this.getTokenList("ether", 60 * 4))
    }

    public stop(): void {
        this.isRunning = false;
    }

    private linkLastCell(ws: any, column: number, address?: string, chain: string = "ether") {
        const cell: Cell = ws.getCell(ws.rowCount, column);
        cell.value = { text: "dexTools link", hyperlink: `https://www.dextools.io/app/en/${chain}/pair-explorer/${address}` };
        cell.style = { font: { color: { argb: 'FF0000FF' }, underline: true } };
    }

    public async storeToken(info: any, token: Token, chain: string) {
        this.worksheet.addRow([
            token.symbol, info.address,
            `https://www.dextools.io/app/en/${chain}/pair-explorer/${info.address}`,
            info.mcap, info.fdv, info.holders
        ]);
        this.linkLastCell(this.worksheet, 3, info.address, chain);
        await this.workbook.xlsx.writeFile("tokens.xlsx");
    }

    public async securityCheck(token: Token, chain: string, debug: boolean = false): Promise<any | false> {
        try {
            const auditResponse = await this.api.getTokenAudit(chain, token.address);
            const audit: Audit = auditResponse.data.data;

            const infoResponse = await this.api.getTokenInfo(chain, token.address);
            const info: Info = infoResponse.data.data;

            if (audit.isPotentiallyScam === "yes" || audit.isHoneypot === "yes" ||
                (audit.isContractRenounced !== "yes") ||
                (audit.sellTax.max > 0.02 || audit.buyTax.max > 0.02) ||
                (info.holders < 10)) {
                throw new Error();
            }

            return { address: token.address, ...audit, ...info };
        } catch (error: any) {
            if (debug) {
                console.error(`Security check failed`);
            }
            return false;
        }
    }

    public async getTokenList(chain: string, timeRange: number, pageSize: number = 50): Promise<any> {
        const now = toZonedTime(new Date(), 'UTC');

        console.log(addHours(subMinutes(now, timeRange), 2).toISOString(),
            addHours(now, 2).toISOString())
        const tokensListResponse = await this.api.getTokenList(chain,
            "creationTime",
            "desc",
            addHours(subMinutes(now, timeRange), 2).toISOString(),
            addHours(now, 2).toISOString(),
            0,
            pageSize
        );

        console.log(tokensListResponse)
        console.log(`${tokensListResponse.data.tokens.length} tokens found`);
        return tokensListResponse.data.tokens;
    }
}

export default TokenSearcher;
