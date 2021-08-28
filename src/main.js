import fs from 'fs/promises';
import Gameboy from './gameboy';

var gameboy;

fs.readFile('cpu_instrs/individual/06-ld r,r.gb').then((value) => main(value)).catch((reason) => console.log(reason));

function main(value) {
    gameboy = new Gameboy(value);
    gameboy.cpu.reset(0x100);
    
    while (!gameboy.cpu.paused) {
        gameboy.tick();
    }
}