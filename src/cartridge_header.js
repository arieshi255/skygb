import { header } from './definitions';
import { getKeyByValue } from './helpers';

const CartType = {
    ROM_ONLY: 0,
    MBC1: 1,
    UNKNOWN: 2
};

const ROMSize = {
    KiB32: 0,
    KiB64: 1,
    KiB128: 2,
    KiB256: 3,
    KiB512: 4
};

const RAMSize = {
    NONE: 0,
    KB2: 1,
    KB8: 2,
    KB32: 3,
    KB64: 4,
    KB128: 5
};

class CartInfo {
    constructor() {
        this.title = '';
        this.type = CartType.UNKNOWN;
        this.romSize = ROMSize.KiB32;
        this.ramSize = RAMSize.NONE;
        this.version = 0x0;
    }
}

function getROMSize(romSize) {
    switch (romSize) {
        case 0x00:
            return ROMSize.KiB32;
        case 0x01:
            return ROMSize.KiB64;
        case 0x02:
            return ROMSize.KiB128;
        case 0x03:
            return ROMSize.KiB256;
        case 0x04:
            return ROMSize.KiB512;
        default:
            return ROMSize.KiB32;
    }
}

function getRAMSize(ramSize) {
    switch (ramSize) {
        case 0x00:
            return RAMSize.NONE;
        case 0x01:
            return RAMSize.KB2;
        case 0x02:
            return RAMSize.KB8;
        case 0x03:
            return RAMSize.KB32;
        case 0x05:
            return RAMSize.KB64;
        case 0x04:
            return RAMSize.KB128;
        default:
            return RAMSize.NONE;
    }
}

function getType(typeCode) {
    switch (typeCode) {
        case 0x00:
        case 0x08:
        case 0x09:
            return CartType.ROM_ONLY;
        case 0x01:
        case 0x02:
        case 0x03:
        case 0xFF:
            return CartType.MBC1;
        case 0x0B:
        case 0x0C:
        case 0x0D:
        case 0x20:
        case 0x22:
        case 0xFC:
        case 0xFD:
        case 0xFE:
            return CartType.UNKNOWN;
        default:
            console.error('Unknown cartridge type: %s', typeCode.toString(16));
            return CartType.UNKNOWN;
    }
}

function getInfo(romBuffer) {
    let info = new CartInfo();

    let typeCode = romBuffer[header.cartridgeType];
    let versionCode = romBuffer[header.versionNumber];
    let romSize = romBuffer[header.romSize];
    let ramSize = romBuffer[header.ramSize];

    info.type = getType(typeCode);
    info.version = versionCode;
    info.romSize = getROMSize(romSize);
    info.ramSize = getRAMSize(ramSize);
    info.title = romBuffer.slice(header.title, header.title + 0xA);

    console.log(`Title:\t\t ${info.title} (version ${info.version})`);
    console.log(`Cartridge:\t\t ${getKeyByValue(CartType, info.type)}`);
    console.log(`ROM size:\t\t ${getKeyByValue(ROMSize, info.romSize)}`);
    console.log(`RAM size:\t\t ${getKeyByValue(RAMSize, info.ramSize)}`);

    return info;
}

export { CartType, getInfo };