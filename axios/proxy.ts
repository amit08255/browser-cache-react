/* eslint-disable no-param-reassign */
/**
 * This file allows to setup global proxy for client-side requests
 * When any request is made with URL starting with URI provided in source,
 * the source URI is replaced with target URL. Default source URI is /api.
 *
 * If you do not want to replace path with proxy,
 * just run the app without setting any DEV_SERVER_URL. It will work as normal.
 *
 * To set server URL run below command in CMD (remember to not add space)
 * before running app:
 *
 * set DEV_SERVER_URL=http://localhost:8080
 *
 * Default source URI is /api.
 * To set custom API source URI run below command in CMD
 * (remember to not add space) before running app:
 *
 * set API_SOURCE_URI=/mycustomapi
 *
 * When request is made using below code: The final request is sent to URL:
 * http://localhost:8000/api/getaccount
 *
 * axios.get('/api/getaccount').then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
    });
*/

import getConfig from 'next/config';

const getRuntimeConfig = (config) => config.publicRuntimeConfig;

const getEnvironmentVariable = (name) => {
    const config = getConfig();
    const env = getRuntimeConfig(config);
    return env ? env[name] : '';
};

const target = getEnvironmentVariable('DEV_SERVER_URL');
const source = getEnvironmentVariable('API_SOURCE_URI') || '/api';

const setAxiosProxy = (config) => {
    if (target && config.url.startsWith(source)) {
        config.url = new URL(config.url, target).href;
    }

    return config;
};

export default setAxiosProxy;
