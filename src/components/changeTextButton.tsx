import React, { useState } from 'react';

// Define a type for the props
type ChangeTextButtonProps = {
    initialText: string;
    alternateText: string;
    changeState: () => void;
};

const ChangeTextButton: React.FC<ChangeTextButtonProps> = ({ initialText, alternateText, changeState }) => {
    const [text, setText] = useState(initialText);

    const handleClick = () => {
        setText(prevText => prevText === initialText ? alternateText : initialText);
        changeState();
    };

    return (
        <button onClick={handleClick} className="bg-orange-500 px-5 py-3 rounded-lg text-slate-50 text-xl font-bold">
            {text}
        </button>
    );
};

export default ChangeTextButton;
