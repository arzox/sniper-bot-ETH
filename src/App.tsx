import {ChangeTextButton} from "./components/components";
import {useState} from "react";
import TokenSearcher from "./lib/research";
import DextoolsAPI from "./lib/dextoolsAPI";
import {constants} from "./lib/constants";

const App = () => {
    const [isRunning, setIsRunning] = useState(false);
    const api = new DextoolsAPI(constants.api.dextools);
    const tokenSearcher = new TokenSearcher(api);

    const setRunning = () => {
        setIsRunning(!isRunning);
        if (!isRunning) {
            tokenSearcher.start();
        } else {
            tokenSearcher.stop();
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