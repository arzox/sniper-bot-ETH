import React from 'react';

const formatTokenPrice = (num: string) => {

    // Match leading zeros and the significant digits
    const match = num.match(/^0\.0+(.*)$/);
    if (match) {
        const leadingZeros = match[0].length - match[1].length - 2; // Number of leading zeros
        const significantDigits = match[1].replace(/\.?0+$/, ''); // Extract significant digits
        return (
            <>
                0.0<sub>{leadingZeros}</sub>{significantDigits}
            </>
        );
    } else {
        return num.toString();
    }
};

export default formatTokenPrice;