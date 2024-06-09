import {isHoneyPot} from "./honeyPotAPI";
import {getContractAudit} from "./defiAPI";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

const pepe = "0x6982508145454ce325ddbe47a25d4ec3d2311933"

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function test() {

}