import React from "react";

type ImageButtonProps = {
    src: string;
    onClick: () => void;
}

const ImageButton: React.FC<ImageButtonProps> = ({ src, onClick }) => {
    return (
        <>
            <img className="hover:cursor-pointer hover:bg-white p-2 rounded-lg" src={src} onClick={onClick}/>
        </>
    )
}

export default ImageButton;