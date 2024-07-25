const funWithRetry = async (fun: any, retry: number, recoveryTime: number) => {
    let err = false;
    let retries = 0
    do {
        try {
            return fun();
        } catch (e) {
            console.log(e)
            err = true
            await sleep(recoveryTime * 1000)
        }
    } while (err && retries <= retry)
};

const sleep = async(number: number) => {
    return new Promise(resolve => setTimeout(resolve, number));
}

export {
    funWithRetry,
    sleep
};