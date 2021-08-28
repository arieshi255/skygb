import { CartType, getInfo } from './cartridge_header';

class Cartridge {
    constructor(romBuffer, ramBuffer, info) {
        this.romBuffer = romBuffer;
        this.ramBuffer = ramBuffer;
        this.info = info;
    }
}

class NoMBC extends Cartridge {
    constructor(romBuffer, ramBuffer, info) {
        super(romBuffer, ramBuffer, info);
    }

    read(address) {
        console.log('Unimplemented!');
    }

    write(address, value) {
        console.log('Attempting to write to ROM with no MBC');
    }
}

class MBC1 extends Cartridge {
    constructor(romBuffer, ramBuffer, info) {
        super(romBuffer, ramBuffer, info);
    }

    read(address) {
        console.log('Unimplemented!');
    }

    write(address, value) {
        console.log('Unimplemented!');
    }
}

function getCartridge(romBuffer, ramBuffer) {
    let info = getInfo(romBuffer);

    switch (info.type) {
        case CartType.ROM_ONLY:
            return new NoMBC(romBuffer, ramBuffer, info);
        case CartType.MBC1:
            return new MBC1(romBuffer, ramBuffer, info);
        case CartType.UNKNOWN:
            console.log('Unknown cartridge type..');
            return 0;
    }
}

export { getCartridge, Cartridge, NoMBC, MBC1 }