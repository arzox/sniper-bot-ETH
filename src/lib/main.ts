import {quote} from "./quote";
import {FeeAmount} from "@uniswap/v3-sdk";
import {WETH} from "./constants";
import getTokenFromAddress from "./tokenInfo";
import TokenSearcher from "./research";
import {constants} from "./constants";
import DextoolsAPI from "./dextoolsAPI";

const api = new DextoolsAPI(constants.api.dextools);
const tokenSearcher = new TokenSearcher(api);
const isRunning = false;
