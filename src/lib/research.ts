import {addHours, subMinutes} from 'date-fns';
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

    public async securityCheck(chain: string, token: Token, debug: boolean = false): Promise<any | false> {
        try {
            const auditResponse = await this.api.getTokenAudit(chain, token.address);
            const audit: Audit = auditResponse.data;

            await this.sleep(1000);

            const infoResponse = await this.api.getTokenInfo(chain, token.address);
            const info: Info = infoResponse.data;

            await this.sleep(1000);

            if (audit.isPotentiallyScam === "yes" || audit.isHoneypot !== "no" ||
                (audit.isContractRenounced !== "yes") ||
                (audit.sellTax.max > 0.1 || audit.buyTax.max > 0.02) ||
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

        const tokensListResponse = await this.api.getTokenList(chain,
            "creationTime",
            "asc",
            addHours(subMinutes(now, timeRange + 4), 2).toISOString(),
            addHours(subMinutes(now, 4), 2).toISOString(),
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
