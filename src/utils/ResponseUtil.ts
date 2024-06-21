export function httpResponse(body: any, statusCode = 200, headers: any = {}) {
    return {
        body: JSON.stringify(body),
        headers: {
            Accept: 'application/json',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            ...headers,
        },
        statusCode,
    };
}
