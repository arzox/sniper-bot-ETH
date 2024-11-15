import { ethers } from 'ethers'

const READABLE_FORM_LEN = 4

export function fromReadableAmount(
    amount: number,
    decimals: number
): BigInt {
    return ethers.parseUnits(amount.toString(), decimals)
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
    return ethers
        .formatUnits(rawAmount, decimals)
}