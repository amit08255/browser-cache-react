/* eslint-disable no-console */
import stringify from './stringify';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Data = { value: any, expiry?: number };

const getStoreKey = (key:string) => `AxioCache.${key}`;

const LocalCache = {
    set(key: string, value: any, expiryTime?: number) {
        if (!key || typeof value === 'undefined') return;

        const expiryTimeMs = typeof expiryTime === 'number' ? expiryTime : 0;

        const now = new Date().getTime();
        const expiry = now + expiryTimeMs;

        const data: Data = { value };

        if (expiryTimeMs) data.expiry = expiry;
        try {
            localStorage.setItem(getStoreKey(key), stringify(data));
        } catch (e) {
            console.log('\nFailed to set local cache: ', e);
            // Exception handling
        }
    },

    get(key: string):any {
        try {
            const dataStr = localStorage.getItem(getStoreKey(key));
            if (!dataStr) return null;

            const item = JSON.parse(dataStr);
            const now = new Date().getTime();

            if (item.expiry && now > item.expiry) {
                localStorage.removeItem(getStoreKey(key));
                return null;
            }

            return [item.value, item.expiry];
        } catch (err) {
            return null;
        }
    },

    remove(key: string) {
        try {
            localStorage.removeItem(getStoreKey(key));
        } catch (e) {
            // Exception handling
        }
    },

    sync() {
        const data = {};

        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('AxioCache.')) {
                    const dataKey = key.replace('AxioCache.', '');
                    const value = this.get(dataKey);

                    if (value) {
                        data[dataKey] = value;
                    }
                }
            });
        } catch (e) {
            // Exception handling
        }

        return data;
    },

    clear() {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('AxioCache.')) {
                    const dataKey = key.replace('AxioCache.', '');
                    this.remove(dataKey);
                }
            });
        } catch (e) {
            // Exception handling
        }
    },
    clearWithPrefix(prefix:string) {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith(`AxioCache.${prefix}`)) {
                    const dataKey = key.replace('AxioCache.', '');
                    this.remove(dataKey);
                }
            });
        } catch (e) {
            // Exception handling
        }
    },
};

export default LocalCache;
