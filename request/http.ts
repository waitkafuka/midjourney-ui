
const localIp = '127.0.0.1';
declare const window: Window & { browserFinger: string }
// chat接口的vercel地址
export let dbApiServerBaseUrlVercel = process.env.NODE_ENV === 'development' ? `http://${localIp}:5312` : 'https://chatdb.youyi.asia';
export let dbApiServerBaseUrlAliyun = '';

//请求服务器
export const request = async function (path: string, data: any, method = "POST", headers = {}, isReuqestAliyun = false) {
    let url = `${isReuqestAliyun ? dbApiServerBaseUrlAliyun : dbApiServerBaseUrlVercel}/api/${path}`;
    const options: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...headers,
            'x-bf': window.browserFinger
        },
        method,
        credentials: 'include',
        body: JSON.stringify(data)
    };

    if (method === 'GET') {
        delete options.body;
    }
    let result = await fetch(url, options);
    return await result.json();
}

//请求国内服务器
export const requestAliyun = async function (path: string, data?: any, method = "POST", headers = {}) {
    return request(path, data, method, headers, true);
}

