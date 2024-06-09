import React from "react";
import "./input.css";

type inputProps = {
    label: string;
}

const Input: React.FC<inputProps> = ({label}) => {
    return (
        <div className="form">
            <input className="input" placeholder={label} type="text"/>
            <span className="input-border"></span>
        </div>
    )
}

export default Input;