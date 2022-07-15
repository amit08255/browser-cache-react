/* eslint-disable no-console */
/// <reference types="../cache" />

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import CacheStore from '..';
import getHashKey from './hash';
import setAxiosProxy from './proxy';

/**
 * Expiry time format in cache:
 * Key -> Name
 * Y -> Year
 * M -> Month
 * D -> Day
 * h -> Hour
 * m -> Minute
 * s -> Second
 * "1M 15D 20h" // 1 month 15 days 20 hours
 * { s: 1 } // 1 second
 * 1000 // 1 second
 * "1s" // 1second
 *
 * Getting value in cache:
 * cache.get("key");
 *
 * To use this interceptor you just need to import it in your code. Nothing else required.
 * This interceptor only caches the GET requests where expiryTime is provided in config.
 *
 * Example:
 *
 * const config:any = { headers, params: data, expiryTime: '1h' };
 * axios.get(url, config);
 *
 * Optional config:
 * useLocalStorage: boolean [Allows to toggle data in localstorage]
 */

const getHashedFullCacheKey = (config) => (
    `${getHashKey(config.url)}-${getHashKey(config.params)}`
);

const getHashedPartialCacheKey = (config) => (
    `${getHashKey(config.url)}`
);

const cache = CacheStore();

// On request, return the cached version, if any
axios.interceptors.request.use((req) => {
    const request = setAxiosProxy(req);

    // clear cache POST requests
    if (request.method === 'post') {
        const key = getHashedPartialCacheKey(request);
        cache.clearWithPrefix(key);
    }

    // Only cache GET requests
    if (request.method === 'get') {
        const key = getHashedFullCacheKey(request);
        const cached = cache.get(key);

        if (cached) {
            console.log(`"${request.url}" served from cache`);
            request.data = cached;

            // Set the request adapter to send the cached response
            // and prevent the request from actually running
            request.adapter = ():Promise<any> => Promise.resolve({
                data: cached,
                status: 200,
                statusText: 'OK',
                headers: request.headers,
                config: request,
                request,
            });
        }
    }

    return request;
}, (error) => Promise.reject(error));

// On response, set or delete the cache
axios.interceptors.response.use((response) => {
    const key = getHashedFullCacheKey(response.config);
    const { config } = response as any;
    if (config.method === 'get' && config.expiryTime) {
        // On get request, store the response in the cache
        cache.put(key, response.data, config.expiryTime, config.useLocalStorage);
    }
    return response;
}, (error) => Promise.reject(error));
