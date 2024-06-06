

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function test() {
    // const provider = new ethers.JsonRpcProvider(constants.rpc.mainnet);
    // const PEPE = await getTokenFromAddress("0x6982508145454ce325ddbe47a25d4ec3d2311933");
    // this.tokenWatcher.addToken(PEPE.address);
    // const trade = await createTrade("0.0005", PEPE);
    // await executeTrade("0.00005", PEPE, new ethers.Wallet(constants.wallet.privateKey, provider));

    const task = new AsyncTask();
    task.start();
    await sleep(5000);
    task.stop();
}

class AsyncTask {
    private isRunning: boolean;
    private intervalId: NodeJS.Timeout | null;

    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }

    start() {
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.task();
        }, 1000); // Run task every second
    }

    async task() {
        // Simulate async work
        console.log('Task running...');
    }

    stop() {
        console.log(this.isRunning)
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.isRunning = false;
    }
}