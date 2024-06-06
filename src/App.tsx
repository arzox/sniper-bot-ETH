import {ChangeTextButton, TokenDisplay} from "./components/components";
import {useEffect, useState} from "react";
import {test} from "./lib/test";

const App = () => {
    const [isRunning, setIsRunning] = useState(false);

    const setRunning = () => {
        setIsRunning(!isRunning);
    }

    useEffect(() => {
        //test();
    })

    return (
        <>
            <main className="flex justify-center items-center flex-col w-2/3 m-auto mt-10 gap-7">
                <ChangeTextButton initialText="Start" alternateText="Stop" changeState={setRunning}/>
                <h1 className="text-3xl font-bold text-gray-800">Promising Tokens</h1>
                <TokenDisplay isRunning={isRunning} />
            </main>
        </>
    )
}

export default App