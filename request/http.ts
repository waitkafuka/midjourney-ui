
declare const window: Window & { browserFinger: string }

//请求服务器
export const request = async function (path: string, data: any, method = "POST", headers = {},) {
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
    let result = await fetch(path, options);
    return await result.json();
}


//请求国内服务器
export const requestAliyun = async function (path: string, data?: any, method = "POST", headers = {}) {
    return request(`/api/${path}`, data, method, headers);
}

//请求国内服务器
export const requestAliyunArt = async function (path: string, data?: any, method = "POST", headers = {}) {
    return request(`/art/api/${path}`, data, method, headers);
}

