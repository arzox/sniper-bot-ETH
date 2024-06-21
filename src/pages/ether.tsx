import {ChangeTextButton, ToggleSwitch, TokenDisplay, ImageButton, Input} from "../components/components";
import {useEffect, useState} from "react";
import {test} from "../lib/ether/test";
import solIcon from "../assets/solana-icon.png";

const Ether = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [isDebug, setIsDebug] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const setRunning = () => {
        setIsRunning(!isRunning);
    }

    const openSol = () => {
        window.location.href = "/solana";
    }

    useEffect(() => {
        test();
    })

    return (
        <main className="flex justify-center items-center flex-col w-2/3 m-auto mt-10 gap-7 bg-slate-200">
            <ChangeTextButton initialText="Start" alternateText="Stop" changeState={setRunning}/>
            <div className="fixed left-4 top-4 w-14">
                <ImageButton src={solIcon} onClick={openSol}/>
            </div>
            <div
                className="flex flex-col justify-center bg-white p-8 rounded-2xl shadow-lg gap-4 fixed top-1/2 -translate-y-1/2 left-4">
                <ToggleSwitch label={"Debug"} changeState={() => {
                    setIsDebug(!isDebug)
                }}/>
                <ToggleSwitch label={"Buy"} changeState={() => {
                    setIsBuying(!isBuying)
                }}/>
                <Input label={"Wallet Key"}/>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Promising Tokens</h1>
            <TokenDisplay isRunning={isRunning} isBuying={isBuying} isDebubg={isDebug}/>
        </main>
    )
}

export default Ether;