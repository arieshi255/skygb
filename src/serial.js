import { stdout } from 'process';

class Serial {
    constructor() {
        this.data = 0;
    }

    read() {
        return this.data;
    }

    write(value) {
        this.data = value;
    }

    writeControl(value) {
        if (value & 0x80) {
            process.stdout.write(String.fromCharCode(data));
        }
    }
}

export { Serial };