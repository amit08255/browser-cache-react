/* eslint-disable no-param-reassign */
const hasProp = Object.prototype.hasOwnProperty;

function throwsMessage(err) {
    return `[Throws: ${ err ? err.message : '?' }]`;
}

function safeGetValueFromPropertyOnObject(obj, property) {
    if (hasProp.call(obj, property)) {
        try {
            return obj[property];
        } catch (err) {
            return throwsMessage(err);
        }
    }

    return obj[property];
}

// Get safe JSON without circular properties
function ensureProperties(json) {
    const seen = []; // store references to objects we have seen before

    function visit(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (seen.indexOf(obj) !== -1) {
            return '[Circular]';
        }
        seen.push(obj);

        if (typeof obj.toJSON === 'function') {
            try {
                const fResult = visit(obj.toJSON());
                seen.pop();
                return fResult;
            } catch (err) {
                return throwsMessage(err);
            }
        }

        if (Array.isArray(obj)) {
            const aResult = obj.map(visit);
            seen.pop();
            return aResult;
        }

        const result = Object.keys(obj).reduce((item, prop) => {
            // prevent faulty defined getter properties
            item[prop] = visit(safeGetValueFromPropertyOnObject(obj, prop));
            return result;
        }, {});
        seen.pop();
        return result;
    }

    return visit(json);
}

function stringify(data) {
    const constructor = data && data.constructor;
    if (constructor === Object) return JSON.stringify(ensureProperties(data));
    if (constructor === Number) return `${data}`;

    return data;
}

export default stringify;
