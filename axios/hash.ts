/* eslint-disable no-bitwise */

import stringify from '../stringify';

const MAGIC_CONSTANT = 5381;

function djb2aHash(string) {
    let hash = MAGIC_CONSTANT;

    for (let index = 0; index < string.length; index += 1) {
        // Equivalent to: `hash * 33 ^ string.charCodeAt(i)`
        hash = ((hash << 5) + hash) ^ string.charCodeAt(index);
    }

    // Convert it to an unsigned 32-bit integer.
    return hash >>> 0;
}

function getHashKey(data) {
    return djb2aHash(stringify(data) || '');
}

export default getHashKey;
