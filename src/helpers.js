import { TABLE_RP } from './definitions';

function getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] == value);
}

function getKeyByIndex(obj, i) {
    return Object.keys(obj)[i];
}

function getValueByIndex(obj, i) {
    return obj[Object.keys(obj)[i]];
}

function getRP(p) {
    let r0 = '';
    let r1 = '';

    switch (p) {
        case TABLE_RP.BC:
            r0 = 'b';
            r1 = 'c';
            break;
        case TABLE_RP.DE:
            r0 = 'd';
            r1 = 'e';
            break;
        case TABLE_RP.HL:
            r0 = 'h';
            r1 = 'l';
            break;
    }

    return {
        r0: r0,
        r1: r1
    };
}

export { getKeyByValue, getKeyByIndex, getValueByIndex, getRP };