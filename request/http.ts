
declare const window: Window & { browserFinger: string }

//请求服务器
export const request = async function ({ path, data, method = "POST", headers = {}, stream = false, onDataChange }: { path: string, data?: any, method?: string, headers?: any, stream?: boolean, onDataChange?: Function }) {
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
    let response = await fetch(path, options);
    if (stream) {
        if (!response.body) return;
        const reader = response.body.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }

                        // 将获取的数据转换回字符串
                        const string = new TextDecoder("utf-8").decode(value);
                        // console.log(new Date(), string); // 在此处你可以看到进度和图片URL
                        const data = JSON.parse(string);
                        // console.log(data); // 在此处你可以看到进度和图片URL

                        onDataChange && onDataChange(data);

                        controller.enqueue(value);
                        push();
                    });
                };
                push();
            }
        });
    } else {
        return await response.json();
    }
}

//请求国内服务器
export const requestAliyun = async function (path: string, data?: any, method = "POST", headers = {}) {
    return request({ path: `/api/${path}`, data, method, headers });
}

//请求国内服务器
export const requestAliyunArt = async function (path: string, data?: any, method = "POST", headers = {}) {
    return request({ path: `/art/api/${path}`, data, method, headers });
}

//请求国内服务器 stream
export const requestAliyunArtStream = async function ({
    path, data, method = "POST", headers, onDataChange
}: { path: string, data?: any, method?: string, headers?: any, onDataChange: Function }) {
    return request({ path: `/art/api/${path}`, data, method, headers, stream: true, onDataChange });
}

