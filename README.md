# Browser Cache React

Client side caching for React with Axios caching support.

## Expiry time format in cache

| Key | Name   |
| --- | ------ |
| Y   | Year   |
| M   | Month  |
| D   | Day    |
| h   | Hour   |
| m   | Minute |
| s   | Second |

## Creating cache instance

```js
const cache = CacheStore();
```

## Setting value in cache

```js
cache.put("key", value, "1M 15D 20h"); // 1 month 15 days 20 hours
cache.put("key", value, { s: 1 }); // 1 second
cache.put("key", value, 1000); // 1 second
cache.put("key", value, "1s"); // 1second
```

## Getting value in cache

```js
cache.get("key");
```

## Setting up with axios

To use axios interceptor you just need to import `axios/index.ts` it in your code. Nothing else is required. This interceptor only caches the GET requests where expiryTime is provided in config.

### Example

```ts
const config:any = { headers, params: data, expiryTime: '1h', useLocalStorage: false };
axios.get(url, config);
```
