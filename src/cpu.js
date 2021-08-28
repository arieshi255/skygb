import { getKeyByIndex, getValueByIndex, getRP } from './helpers';
import { TABLE_RP, TABLE_CC, FLAGS, TABLE_R } from './definitions';

class Opcodes {
    constructor(cpu) { 
        this.cpu = cpu;
    }

    on_LD_R_R(y, z) {
        let r1 = getValueByIndex(this.cpu.registers, z);
        let r0_key = getKeyByIndex(this.cpu.registers, y);
        let r1_key = getKeyByIndex(this.cpu.registers, z);

        console.log(`LD ${r0_key}, ${r1_key}`);

        this.cpu.registers[r0_key] = r1;

        this.cpu.registers.t += 4;
        this.cpu.registers.m += 1;
    }

    on_LD_RP_NN(p, value) {
        let rp = getRP(p);

        if (p != TABLE_RP.SP) {
            this.cpu.registers[rp.r0] = value & 0xFF;
            this.cpu.registers[rp.r1] = (value >> 8) & 0xFF;
        } else {
            this.cpu.registers.sp = value;
        }

        this.cpu.registers.t += 12;
        this.cpu.registers.m += 3;
    }

    on_ADD_RP(p) {
        let rp = getRP(p);

        if (p != TABLE_RP.SP) {
            this.cpu.registers.h = this.cpu.registers[rp.r0] & 0xFF;
            this.cpu.registers.l = (this.cpu.registers[rp.r1] >> 8) & 0xFF;
        } else {
            this.cpu.registers.h = this.cpu.registers.sp & 0xFF;
            this.cpu.registers.l = (this.cpu.registers.sp >> 8) & 0xFF;
        }

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_JP_CC_NN(y, value) {
        let cc = getValueByIndex(TABLE_CC, y);

        switch (cc) {
            case TABLE_CC.NZ:
                if (!this.cpu.getFlag(FLAGS.Z)) 
                    this.cpu.registers.pc = value;
                break;
            case TABLE_CC.Z:
                if (this.cpu.getFlag(FLAGS.Z))
                    this.cpu.registers.pc = value;
                break;
            case TABLE_CC.NC:
                if (!this.cpu.getFlag(FLAGS.C))
                    this.cpu.registers.pc = value;
                break;
            case TABLE_CC.C:
                if (this.cpu.getFlag(FLAGS.C))
                    this.cpu.registers.pc = value;
                break;
        }

        if (this.cpu.registers.pc == value) {
            this.cpu.registers.t += 16;
            this.cpu.registers.m += 4;
        } else {
            this.cpu.registers.t += 12;
            this.cpu.registers.m += 3;
        }
    }

    on_LD_RP_A(p) {
        let rp = getRP(p);
        let address = (this.cpu.registers[rp.r0] << 8) | this.cpu.registers[rp.r1];

        this.cpu.mmu.write(address, this.cpu.registers.a);

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_LD_R_N(y, value) {
        let r = getKeyByIndex(this.cpu.registers, y);
        let address = (this.cpu.registers.h << 8) | this.cpu.registers.l;

        if (r != TABLE_R.HL) { 
            this.cpu.registers[r] = value;
        } else {
            this.cpu.mmu.write(address, value);
        }

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_LD_A_RP(p) {
        let rp = getRP(p);
        let address = (this.cpu.registers[rp.r0] << 8) | this.cpu.registers[rp.r1];

        this.cpu.registers.a = this.cpu.mmu.read(address);

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_LDI_A_HL() {
        let address = (this.cpu.registers.h << 8) | this.cpu.registers.l;
        
        this.cpu.registers.a = this.cpu.mmu.read(address + 1);

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_LDD_A_HL() {
        let address = (this.cpu.registers.h << 8) | this.cpu.registers.l;
        
        this.cpu.registers.a = this.cpu.mmu.read(address - 1);

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_INC_RP(p) {
        let rp = getRP(p);
        let value = ((this.cpu.registers[rp.r0] << 8) | this.cpu.registers[rp.r1]) + 1;

        if (rp != TABLE_RP.SP) {
            this.cpu.registers[rp.r0] = value & 0xFF;
            this.cpu.registers[rp.r1] = (value >> 8) & 0xFF;
        } else {
            this.cpu.registers.sp = value;
        }

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_DEC_RP(p) {
        let rp = getRP(p);
        let value = ((this.cpu.registers[rp.r0] << 8) | this.cpu.registers[rp.r1]) - 1;

        if (rp != TABLE_RP.SP) {
            this.cpu.registers[rp.r0] = value & 0xFF;
            this.cpu.registers[rp.r1] = (value >> 8) & 0xFF;
        } else {
            this.cpu.registers.sp = value;
        }

        this.cpu.registers.t += 8;
        this.cpu.registers.m += 2;
    }

    on_INC_R(y)  {
        let r = getKeyByIndex(this.cpu.registers, y);

        this.cpu.clearFlag(FLAGS.N);

        if (r != TABLE_R.HL) {
            if (this.cpu.registers[r] + 1 >= 255) {
                this.cpu.registers[r] = 0;
                this.cpu.setFlag(FLAGS.Z);
            } else { 
                this.cpu.registers[r] += 1;
                this.cpu.clearFlag(FLAGS.Z);
            }
        } else {
            let address = (this.cpu.registers.h << 8) | this.cpu.registers.l;
            let value = this.cpu.mmu.read(address);

            if (value + 1 >= 255) {
                value = 0;
                this.cpu.setFlag(FLAGS.Z);
            } else {
                value += 1;
                this.cpu.clearFlag(FLAGS.Z);
            }

            this.cpu.mmu.write(address, value);
        }

        this.cpu.registers.t += 4;
        this.cpu.registers.m += 1;
    }

    on_DEC_R(y) {
        let r = getKeyByIndex(this.cpu.registers, y);

        this.cpu.setFlag(FLAGS.N);

        if (r != TABLE_R.HL) {
            if (this.cpu.registers[r] - 1 <= 0) {
                this.cpu.registers[r] = 0;
                this.cpu.setFlag(FLAGS.Z);
            } else { 
                this.cpu.registers[r] -= 1;
                this.cpu.clearFlag(FLAGS.Z);
            }
        } else {
            let address = (this.cpu.registers.h << 8) | this.cpu.registers.l;
            let value = this.cpu.mmu.read(address);

            if (value - 1 <= 0) {
                value = 0;
                this.cpu.setFlag(FLAGS.Z);
            } else {
                value -= 1;
                this.cpu.clearFlag(FLAGS.Z);
            }

            this.cpu.mmu.write(address, value);
        }

        this.cpu.registers.t += 4;
        this.cpu.registers.m += 1;
    }

    on_HALT() {
        this.cpu.paused = true;

        this.cpu.registers.t += 4;
        this.cpu.registers.m += 1;
    }

    on_NOP() { 
        this.cpu.registers.t += 4;
        this.cpu.registers.m += 1;
    }
}

class CPU {
    constructor() {
        this.mmu = undefined;
        this.xMask = 0xC0;
        this.yMask = 0x38;
        this.zMask = 0x7;
        this.pMask = 0x30;
        this.qMask = 0x8;
        this.paused = false;
        this.clock = {
            m: 0, t: 0
        };
        this.registers = {
            b: 0, c: 0, d: 0, e: 0, h: 0, l: 0, f: 0, a: 0,
            pc: 0, sp: 0,
            m: 0, t: 0
        };
        this.opcodes = new Opcodes(this);
    }

    getRegisterWords() {
        return {
            bc: (this.registers.b << 8) | (this.registers.c & 0xFF),
            de: (this.registers.d << 8) | (this.registers.e & 0xFF),
            hl: (this.registers.h << 8) | (this.registers.l & 0xFF),
        };
    }

    getFlag(flag) {
        return this.registers.f & flag;
    }

    setFlag(flag) {
        this.registers.f |= flag;
    }

    clearFlag(flag) {
        this.registers.f &= ~(flag);
    }

    getXPart(opcode) {
        return (opcode & this.xMask) >> 4;
    }

    getYPart(opcode) {
        return (opcode & this.yMask) >> 3;
    }

    getZPart(opcode) {
        return opcode & this.zMask;
    }

    getPPart(opcode) {
        return (opcode & this.pMask) >> 4;
    }

    reset(pc = 0) {
        this.registers.a, this.registers.b, this.registers.c, this.registers.d, this.registers.e, this.registers.h, this.registers.l = 0;
        this.registers.pc = pc;
        this.registers.sp = 0;
        this.registers.m, this.registers.t, this.clock.m, this.clock.t = 0;
        this.paused = false;
        
    }

    onIMM8Read() { 
        let byte = this.mmu.read(this.registers.pc++);

        return byte;
    }

    onIMM16Read() { 
        let low = this.mmu.read(this.registers.pc++);
        let high = this.mmu.read(this.registers.pc++);

        return (high << 8) | (low & 0xFF);
    }

    decode(opcode) {
        let y = this.getYPart(opcode);
        let z = this.getZPart(opcode);
        let p = this.getPPart(opcode);
        let regWords = this.getRegisterWords();

        console.log("Opcode: 0x%s\t PC: %d\t SP: %d\r\nRegisters: %s", opcode.toString(16), this.registers.pc, this.registers.sp, JSON.stringify(this.registers));

        switch (opcode & this.xMask) {
            // LD r[y], r[z]
            // HALT
            case 0o100:
                if (y == regWords.hl || z == regWords.hl)
                    return this.opcodes.on_HALT();

                return this.opcodes.on_LD_R_R(y, z);
            // alu [y] r[z]
            case 0o200:
                break;
        }

        switch (opcode & (this.xMask | this.zMask)) {
            // INC r[y]
            case 0o004:
                return this.opcodes.on_INC_R(y);
            // DEC r[y]
            case 0o005:
                return this.opcodes.on_DEC_R(y);
            // LD r[y], n
            case 0o006:
                return this.opcodes.on_LD_R_N(y, this.onIMM8Read());

            // JP cc[y], nn
            case 0o303:
                return this.opcodes.on_JP_CC_NN(y, this.onIMM16Read());
        }

        switch (opcode & (this.xMask | this.zMask | this.qMask)) {
            // LD rp[p], nn
            case 0o001:
                return this.opcodes.on_LD_RP_NN(p, this.onIMM16Read());
            // ADD HL, rp[p]
            case 0o011:
                return this.opcodes.on_ADD_RP(p);
            // DEC rp[p]
            case 0o013:
                return this.opcodes.on_DEC_RP(p);
            // INC rp[p]
            case 0o003:
                return this.opcodes.on_INC_RP(p);
         }
         
        switch (opcode & (this.xMask | this.zMask | this.qMask | (this.pMask - 1))) {
            // LD (rp[p]), A 
            case 0o002:
                return this.opcodes.on_LD_RP_A(p);
            // LD A, (rp[p])
            case 0o012:
                return this.opcodes.on_LD_A_RP(p);
         }

        switch (opcode) {
            // NOP
            case 0x00:
                return this.opcodes.on_NOP();
            // LDI A, (HL)
            case 0x2a:
                return this.opcodes.on_LDI_A_HL();
            // LDD A, (HL)
            case 0x3a:
                return this.opcodes.on_LDD_A_HL();
         }
    }
}

export { CPU };