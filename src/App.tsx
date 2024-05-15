import {ChangeTextButton} from "./components/components";
import {useState} from "react";
import TokenSniper from "./lib/main";

const App = () => {
    const [isRunning, setIsRunning] = useState(false);
    const tokenSniper = new TokenSniper();

    const setRunning = () => {
        setIsRunning(!isRunning);
        if (!isRunning) {
            tokenSniper.start();
        } else {
            tokenSniper.stop();
        }
    }

    return (
        <main className="flex justify-center items-center flex-col w-2/3 m-auto mt-10">
            <ChangeTextButton initialText="Start" alternateText="Stop" changeState={setRunning}/>
            <div className="">

            </div>
        </main>
    )
}

export default App