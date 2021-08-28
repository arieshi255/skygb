import { BIOS } from './definitions';

class MMU {
    constructor(cartridge, cpu, serial) {
        this.rom = new Uint8Array(0x4000);
        this.rom1 = new Uint8Array(0x4000);
        this.vram = new Uint8Array(0x2000);
        this.eram = new Uint8Array(0x2000);
        this.wram = new Uint8Array(0x2000);
        this.oam = new Uint8Array(0xA0);
        this.zram = new Uint8Array(0x7F);

        this.cartridge = cartridge;
        this.cartridge.romBuffer.forEach((value, index) => this.rom[index] = value);
        this.cpu = cpu;
        this.serial = serial;
        this.inBIOS = false;
    }

    read(address) {
        switch (address & 0xF000) {
            // BIOS (256b) / ROM0
            case 0x0000:
                if (this.inBIOS) {
                    if (address < 0x0100)
                        return BIOS[address];
                    else if (this.cpu.registers.pc == 0x0100)
                        this.inBIOS = false;
                }
                
                return this.rom[address];
            
            // ROM0
            case 0x1000:
            case 0x2000:
            case 0x3000:
                return this.rom[address];   

            // ROM1 (16k)
            case 0x4000:
            case 0x5000:
            case 0x6000:
            case 0x7000:
                return this.rom[address];

            // VRAM (8k)
            case 0x8000:
            case 0x9000:
                return this.vram[address & 0x1FFF];
            
            // External RAM (8k)
            case 0xA000:
            case 0xB000:
                return this.eram[address & 0x1FFF];

            // Working RAM (8k)
            case 0xC000:
            case 0xD000:
                return this.wram[address & 0x1FFF];

            // Working RAM shadow
            case 0xE000:
                return this.wram[address & 0x1FFF];

            case 0xF000:
                switch (address & 0x0F00) {
                    // Working RAM shadow
                    case 0x000: case 0x100: case 0x200: case 0x300:
                    case 0x400: case 0x500: case 0x600: case 0x700:
                    case 0x800: case 0x900: case 0xA00: case 0xB00:
                    case 0xC00: case 0xD00:
                        return this.wram[address & 0x1FFF];
        
                    // Object attribute memory
                    // OAM is 160 bytes, remaining bytes read as 0
                    case 0xE00:
                        if(address < 0xFEA0)
                            return this.oam[address & 0xFF];
                        else
                            return 0;
        
                    // Zero-page
                    case 0xF00:
                        if (address >= 0xFF80) {
                            return this.zram[address & 0x7F];
                        } else {
                            // I/O control handling
                            // Currently unhandled
                            return 0;
                        }
                }
        }
    }

    readWord(address) {
        let low = this.read(address);
        let high = this.read(address + 1);

        return (high << 8) | (low & 0xFF);
    }

    write(address, value) {
        switch (address & 0xF000) {
            // VRAM (8k)
            case 0x8000:
            case 0x9000:
                this.vram[address & 0x1FFF] = value;
            
            // External RAM (8k)
            case 0xA000:
            case 0xB000:
                this.cartridge.write(address, value);
                //return this.eram[address & 0x1FFF];

            // Working RAM (8k)
            case 0xC000:
            case 0xD000:
                this.wram[address & 0x1FFF] = value;

            // Working RAM shadow
            case 0xE000:
                this.wram[(address - 0x2000) & 0x1FFF] = value;

            case 0xF000:
                switch (address & 0x0F00) {
                    // Working RAM shadow
                    case 0x000: case 0x100: case 0x200: case 0x300:
                    case 0x400: case 0x500: case 0x600: case 0x700:
                    case 0x800: case 0x900: case 0xA00: case 0xB00:
                    case 0xC00: case 0xD00:
                        this.wram[(address - 0x2000) & 0x1FFF] = value;
        
                    // Object attribute memory
                    // OAM is 160 bytes, remaining bytes read as 0
                    case 0xE00:
                        if(address < 0xFEA0)
                            this.oam[address & 0xFF] = value;
                        else
                            return 0;
        
                    // Zero-page
                    case 0xF00:
                        if (address >= 0xFF80) {
                            this.zram[address & 0x7F] = value;
                        } else {
                            // I/O control handling
                            writeIO(address, value);
                            return 0;
                        }
                }
        }
    }

    writeIO(address, value) {
        switch (address) {
            case 0xFF00:
                // Input
            return;
            case 0xFF01:
                this.serial.write(value);
            return;
            case 0xFF02:
                this.serial.writeControl(value);
            return;

        }
    }
}

export { MMU };