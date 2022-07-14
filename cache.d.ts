type MSTimeTable = {
    Y?: number;
    M?: number;
    D?: number;
    h?: number;
    m?: number;
    s?: number;
};

type ExpiryTime = number | string | MSTimeTable;

type CacheStore = {
    put: (key:string, value:any, expiryTimeMs:ExpiryTime, useLocalStorage?: boolean) => void,
    get: (key:string) => any,
    del: (key:string) => boolean,
    clear: () => void,
};
