import {ChangeTextButton, ImageButton} from "../components/components";
import {useEffect, useState} from "react";
import etherIcon from "../assets/ethereum-icon.png";
import {test} from "../lib/ether/test";

const Sol = () => {
    const [isRunning, setIsRunning] = useState(false);

    const openEther = () => {
        window.location.href = "/ethereum";
    }

    function setRunning() {
        setIsRunning(!isRunning);
    }

    useEffect(() => {
        test();
    }, []);

    return (
        <main className="flex justify-center items-center flex-col w-2/3 m-auto mt-10 gap-7 bg-slate-200">
            <div className="fixed left-4 top-4 w-14">
                <ImageButton src={etherIcon} onClick={openEther}/>
            </div>
            <ChangeTextButton initialText="Start" alternateText="Stop" changeState={setRunning}/>
            <h1 className="text-3xl font-bold text-gray-800">Promising Tokens</h1>
        </main>
    );
}

export default Sol;