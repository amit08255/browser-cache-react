/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import LocalCache from './localstorage';
import MemoryCache from './memory';

/**
 * Expiry time format in cache:
 * Key -> Name
 * Y -> Year
 * M -> Month
 * D -> Day
 * h -> Hour
 * m -> Minute
 * s -> Second
 *
 * Setting value in cache:
 * cache.put("key", value, "1M 15D 20h"); // 1 month 15 days 20 hours
 * cache.put("key", value, { s: 1 }); // 1 second
 * cache.put("key", value, 1000); // 1 second
 * cache.put("key", value, "1s"); // 1second
 *
 * Getting value in cache:
 * cache.get("key");
 */

let cacheSynced = false;

export const MS_TIME_TABLE: MSTimeTable = {
    Y: 31556926000,
    M: 2629743830,
    D: 86400000,
    h: 3600000,
    m: 60000,
    s: 1000,
};

const convertObjToMS = (timeObj: MSTimeTable): number => {
    let totalTime = 0;

    Object.keys(timeObj).forEach((key) => {
        const current = timeObj[key];

        if (current && typeof current === 'number') {
            totalTime += current * MS_TIME_TABLE[key];
        }
    });

    return totalTime;
};

const convertStringToMS = (timeStr: string): number => {
    const timeArr = timeStr.split(' ');
    let totalTime = 0;

    timeArr.forEach((time) => {
        const key = /[YMDhms]/g.exec(time);
        const parsedTime = parseInt(time, 10);

        if (!key || !parsedTime) return;

        const currentTime = MS_TIME_TABLE[key[0]];

        totalTime += parseInt(time, 10) * currentTime;
    });

    return totalTime;
};

const getExpiryTime = (expiryTime: ExpiryTime): number => {
    let expiryTimeMs = 0;

    if (expiryTime instanceof Object) {
        expiryTimeMs = convertObjToMS(expiryTime);
    } else if (typeof expiryTime === 'string') {
        expiryTimeMs = convertStringToMS(expiryTime);
    } else if (typeof expiryTime === 'number') {
        expiryTimeMs = expiryTime;
    }

    return expiryTimeMs;
};

const CacheInterface:CacheStore = {
    put(key, value, expiryTime: ExpiryTime, useLocalStorage = false) {
        const expiryTimeMs = getExpiryTime(expiryTime);
        MemoryCache.put(key, value, expiryTimeMs);

        if (useLocalStorage) {
            LocalCache.set(key, value, expiryTimeMs);
        }
    },

    get(key) {
        let value = MemoryCache.get(key);

        if (value) {
            return value;
        }

        value = LocalCache.get(key);

        if (value) {
            MemoryCache.put(key, value[0], value[1]);
            return value[0];
        }

        return null;
    },

    del(key) {
        MemoryCache.del(key);
        LocalCache.remove(key);
        return true;
    },

    clear() {
        MemoryCache.clear();
        LocalCache.clear();
    },
    clearWithPrefix(prefix) {
        MemoryCache.clearWithPrefix(prefix);
        LocalCache.clearWithPrefix(prefix);
    },
};

const CacheStore = ():CacheStore => {
    const syncCache = () => {
        if (typeof localStorage !== 'object') {
            return;
        }

        console.log('\n\nSyncing cache store');
        const localData = LocalCache.sync();

        Object.keys(localData).forEach((key) => {
            const [value, time] = localData[key];
            MemoryCache.put(key, value, time);
        });

        cacheSynced = true;
    };

    if (typeof window === 'object') {
        const windowObj:any = window;

        if (!windowObj.AxioCache) {
            syncCache();
        }
    } else if (!cacheSynced) {
        syncCache();
    }

    return CacheInterface;
};

export default CacheStore;
