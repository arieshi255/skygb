import { MMU } from './mmu';
import { CPU } from './cpu';
import { Serial } from './serial';
import { getCartridge, Cartridge } from './cartridge';

class Gameboy {
    constructor(romBuffer) {
        this.cartridge = getCartridge(romBuffer, []);
        this.cpu = new CPU();
        this.mmu = new MMU(this.cartridge, this.cpu, new Serial());
        this.cpu.mmu = this.mmu;
        //this.#Input = Input();
        //this.#Serial = Serial();
    }

    tick() {
        let opcode = this.mmu.read(this.cpu.registers.pc++);

        this.cpu.decode(opcode & 65535);

        this.cpu.clock.m += this.cpu.registers.m;
        this.cpu.clock.t += this.cpu.registers.t;
    }
}

export default Gameboy;