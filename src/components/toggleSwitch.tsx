import React, {useRef} from "react";

import "./switch.css";

type ToggleSwitchProps = {
    label: string;
    changeState?: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({label, changeState}) => {
    const labelRef = useRef<HTMLLabelElement | null>(null);
    const [isOn, setIsOn] = React.useState(false);

    const handleToggle = () => {
        setIsOn(prevIsOn => !prevIsOn);
        changeState && changeState();
    };

    return (
        <div className="flex items-center justify-between w-[270px]">
            <p className="text-[#2E4546D5]">{label}</p>
            <div className="toggle-switch">
                <input className="toggle-input" type="checkbox"/>
                <label className={`toggle-label ${isOn ? 'on' : 'off'}`} onClick={handleToggle} ref={labelRef}></label>
            </div>
        </div>
    )
}
export default ToggleSwitch