const makeCircularReplacer = () => {
    const seen = new WeakMap();

    return (key, value) => {
        if (value !== null && typeof value === 'object') {
            if (seen.has(value) && seen.get(value) !== key) {
                return '[Circular]';
            }

            seen.set(value, key);
        }

        return value;
    };
};

function stringify(object) {
    return JSON.stringify(object, makeCircularReplacer());
}

export default stringify;
