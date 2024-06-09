import React, { useState } from 'react';

// Define a type for the props
type ChangeTextButtonProps = {
    initialText: string;
    alternateText: string;
    changeState: () => void;
};

const ChangeTextButton: React.FC<ChangeTextButtonProps> = ({ initialText, alternateText, changeState }) => {
    const [text, setText] = useState(initialText);
    const [isOn, setIsOn] = useState(false);

    const handleClick = () => {
        setText(prevText => prevText === initialText ? alternateText : initialText);
        setIsOn(!isOn)
        changeState();
    };

    return (
        <button onClick={handleClick} className={`${isOn ? "bg-orange-500 text-slate-50" : "bg-white text-[#2E4546D5]"} px-5 py-3 rounded-lg shadow-lg text-xl font-bold`}>
            {text}
        </button>
    );
};

export default ChangeTextButton;
