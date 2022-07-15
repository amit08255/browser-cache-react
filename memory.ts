/* eslint-disable @typescript-eslint/no-explicit-any */
let storeObj = {
    cache: {},
    timeouts: {},
};

const getStore = () => {
    if (window) {
        const windowObj:any = window;

        if (!windowObj.AxioCache) {
            windowObj.AxioCache = storeObj;
        } else {
            storeObj = windowObj.AxioCache;
        }
    }

    return storeObj;
};

const MemoryCache = {
    put(key, value, time) {
        const store = getStore();

        const expiryTimeMs = typeof time === 'number' ? time : 0;
        const now = new Date().getTime();
        const expiry = now + expiryTimeMs;

        store.cache[key] = value;
        store.timeouts[key] = expiry;
    },

    get(key) {
        const store = getStore();

        if (typeof key === 'undefined') {
            return store.cache;
        }

        const now = new Date().getTime();

        if (store.timeouts[key] && now > store.timeouts[key]) {
            delete store.timeouts[key];
            return null;
        }

        if (!(key in store.cache)) {
            return null;
        }

        return store.cache[key];
    },

    del(key) {
        const store = getStore();

        delete store.timeouts[key];

        if (!(key in store.cache)) {
            return false;
        }

        delete store.cache[key];
        return true;
    },

    clear() {
        const store = getStore();
        store.cache = {};
        store.timeouts = {};
    },
    clearWithPrefix(prefix:string) {
        const store = getStore();
        const newCache = {};
        const newTimeouts = {};

        Object.keys(store.cache).forEach((key) => {
            if (!key.startsWith(prefix)) {
                newCache[key] = store.cache[key];
                newTimeouts[key] = store.timeouts[key];
            }
        });

        store.cache = newCache;
        store.timeouts = newTimeouts;
    },
};

export default MemoryCache;
