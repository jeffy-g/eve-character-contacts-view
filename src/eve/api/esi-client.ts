/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    <one line to give the program's name and a brief idea of what it does.>
    Copyright (C) 2019  jeffy-g hirotom1107@gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * moved from global.d.ts
 */
declare global {
    type ESIRequestOptions = {
        /**
         * query params for ESI request.
         */
        query?: StringMap<QueryValueTypes>;
        /**
         * will need it for `POST` request etc.
         */
        body?: any;
        /** 
         * if want response data with ignore error then can be set to `true`.
         */
        ignoreError?: boolean;
        /**
         * cancel request immediately
         */
        abortController?: AbortController;
    };

    type ESIErrorLimitReachedError = {
        /**
         * always return 420!
         */
        valueOf(): 420;
    };

    interface IESIClient extends InterfaceType<ESIClient> {

    }
}
/**
 * the EVE ESI base url (version: latest)
 */
const ESI_BASEURL = "https://esi.evetech.net/latest";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEBUG = 1;
/**
 * simple named error class.
 */
class ESIRequesError extends Error {}

/**
 * throws when x-esi-error-limit-remain header value is "0". (http status: 420)
 */
class ESIErrorLimitReachedError extends Error {
    constructor() {
        super("Cannot continue ESI request because 'x-esi-error-limit-remain' is zero!");
    }
    valueOf(): number {
        return 420;
    }
}

/**
 * 
 * @param urlWithParams 
 * @param options 
 * @param pageCount 
 */
async function fetchPages<T>(urlWithParams: string, options: RequestInit, pageCount: number) {
    const responses: Promise<T>[] = [];
    // @ts-ignore The URLSearchParams constructor accepts a type such as StringMap <QueryValueTypes>.
    const params = new URLSearchParams();
    for (let i = 2; i <= pageCount;) {
        // queries.page = i++;
        // @ts-ignore
        params.set("page", i++);
        responses.push(
            fetch(`${urlWithParams}&${params.toString()}`, options).then(response => response.json()) // apply JSON.parse(...);
        );
    }
    return Promise.all(responses).then((jsons: T[]) => {
        // DEVNOTE: let check the page 2, type is array?
        if (Array.isArray(jsons[0])) {
            let combinedArray: any[] = [];
            for (const json of jsons) {
                for (const value of json as unknown as any[]) {
                    combinedArray.push(value);
                }
            }
            return combinedArray as unknown as T;
        }

        return null;
    });
}

// debug response data type.
function printResponseStat(method: string, responseData: any, endpoint: string): void {
    const red = "color: red; font-weight: bold";
    const green = "color: green";
    const normal = "color: inherit; font-weight: inherit"

    const isa = Array.isArray(responseData);
    const style = isa? red: green;
    console.log(
        "Method: %s, typeof: %s, is array?: %c%s%c, endpoint=%s",
        method, typeof responseData, style, isa, normal, endpoint
    );
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                       class or namespace declare.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * 
 */
class ESIClient /* implements IESIClient */ {

    // private scopes: string[];
    private token: Undefable<string>;
    // private ownerCharacterId!: EVEId;

    /**
     * use `AccessToken` by `token`.
     * 
     * obtain access token from ISSOAuthorizedCharacter instance.(refresh if need)
     * 
     * @param token 
     */
    // CHANGES: 1/6/2019, 10:29:26 PM - cache characterId to ownerCharacterId
    useAccessToken(token: string): void {
        // this.scopes = authChar.scopes;
        this.token = token;
    }

    /**
     * 
     * @async
     * @param endpoint can omit first and last slash.
     * @param options query parameters
     * @throws
     */
    async get<T extends any | never>(
        endpoint: string,
        options?: ESIRequestOptions
    ): Promise<T> {
        return this.request("GET", endpoint, options);
    }
    /**
     * 
     * @async
     * @param endpoint can omit first and last slash.
     * @param options query parameters?, json data in `body`
     * @throws
     */
    async post<T extends any | never>(
        endpoint: string,
        options?: ESIRequestOptions
    ): Promise<T> {
        return this.request("POST", endpoint, options);
    }

    /**
     * @param method
     * @param endpoint
     * @param options body is json string
     * @throws
     * @returns
     */
    private async request<T extends any | never>(
        method: string,
        endpoint: string,
        options: ESIRequestOptions = {}
    ): Promise<T> {

        const requestOptions: RequestInit = {
            method,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            mode: "cors",
            // see: http://yagisuke.hatenadiary.com/entry/2018/01/28/181907
            signal: options.abortController? options.abortController.signal: void 0
        };
        const queries: Record<string, string> = {
            language: "en-us",
        };

        if (options.query) {
            // queries = options.query;
            Object.assign(queries, options.query);
        }
        // DEVNOTE: when datasource is not empty string. (e.g - "singularity"
        // in this case must specify datasource.
        // if (datasource === "singularity") {
        //     queries.datasource = datasource;
        // }
        if (this.token !== undefined) {
            (requestOptions.headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
        }
        if (options.body) {
            requestOptions.body = JSON.stringify(options.body);
        }

        const urlWithParams = `${ESI_BASEURL}${endpoint}?${new URLSearchParams(queries).toString()}`;
        // queries.page = 1;
        try {

            // logger.log("verbose", `Firing ${method} ${requestOptions.url}`);

            // fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
            // DEVNOTE: FIXME: 1/27/2019, 12:43:33 AM - URLSearchParams may not be enough...
            const esiResponse: Response = await fetch(
                // @ts-ignore The URLSearchParams constructor accepts a type such as StringMap <QueryValueTypes>.
                `${urlWithParams}`, requestOptions
            );

            const status = esiResponse.status;
            if (!esiResponse.ok && !options.ignoreError) {
                // DEVNOTE: 11/4/2018, 8:59:39 PM
                //  ->  e.g: {"error":"Token is not valid for scope: esi-characterstats.read.v1","sso_status":200}
                //
                //  status: 504, json: {"error":"Timeout contacting tranquility","timeout":10}
                //
                const responseText = await esiResponse.text();
                const logMsg = `request failed: ${method} ${urlWithParams} status: ${status}, message: ${responseText}`;
                console.warn(logMsg);
                if (status === 420) {
                    // DEVNOTE: 2019-3-31 02:29:07 - *Invalidate the subsequent request immediately!!
                    options.abortController && options.abortController.abort();
                    throw new ESIErrorLimitReachedError();
                } else {
                    throw new ESIRequesError(`maybe network disconneted or otherwise request data are invalid. (http status=${status})`);
                }
            } else {
                // console.log("http status:", status);
                // DEVNOTE: 1/5/2019, 10:14:59 PM - 204 No Content
                if (status === 204) {
                    // this result were empty...
                    // const headers = JSON.stringify(esiResponse.headers);
                    // logger.log("verbose", `${requestOptions.url}, status=204, headers={${headers}}`);
                    // return JSON.parse(headers);
                    //  -> for now, I decided to return status code.
                    return { status } as unknown as T;
                }

                const responseData: T = await esiResponse.json();

                DEBUG && printResponseStat(method, responseData, endpoint);

                if (!options.ignoreError) {
                    // for x-pages response.
                    let remainResponseData: T | null = null;
                    /*If_there_is_extra_data:*/ {
                        // undefined and null is NaN
                        const pageCount = parseInt(esiResponse.headers.get("x-pages") as string, 10);
                        // has remaining pages? NaN > 1 === false !isNaN(pageCount)
                        if (pageCount > 1) {
                            console.log(`found "x-pages" header, pages: %d`, pageCount);
                            remainResponseData = await fetchPages(urlWithParams, requestOptions, pageCount);
                        }
                    }

                    // finally, decide product data.
                    if (Array.isArray(responseData)) {
                        if (remainResponseData) {
                            for (const d of remainResponseData as unknown as any[]) {
                                responseData.push(d);
                            }
                        }
                        return responseData;
                    } else {
                        remainResponseData && Object.assign(responseData, remainResponseData);
                        return responseData;
                    }

                } else { // meaning `ignoreError`
                    return responseData;
                }
            }

        } catch (e) {
            // console.error(`FAILED ${method} ${requestOptions.url}, throwing error.`, err);//retrying...
            // logger.log("info", `FAILED ${method} ${requestOptions.url}, throwing error.`);//retrying...
            throw e;
        }
    }
}


// namespace _NsESIClient {

    /**
     * 
     * @param token 
     */
    export function getInstance(token?: string): IESIClient {
        const esi = new ESIClient();
        token && esi.useAccessToken(token);
        return esi;
    }

    /**
     *  UPDATE: 2018-7-12 can choose http method.(get or post, default is "get")
     * 
     * ---
     * ```
this.alliance = await EsiClient.fetchEndpoint(
    `/v3/alliances/${this.alliance_id}/`
);
```
     * ---
     * @param endpoint e.g /{version}/characters/{character_id}/assets/  
     *   can omit first and last slash.
     * @param options
     * @param esiPlaceHolder if need EsiClient instance then use this parameter.
     * @param token undefined or access token.
     * @throws
     */
    export async function fetchEndpoint<T>(
        endpoint: string,
        options: ESIRequestOptions = {},
        esiPlaceHolder?: { esi?: IESIClient },
        token?: string,
        method: "get" | "post" = "get"
    ): Promise<T> {
        const esi = getInstance(token);
        if (esiPlaceHolder !== null && typeof esiPlaceHolder === "object") {
            esiPlaceHolder.esi = esi;
        }
        /* JsonObject */
        return await esi[method](endpoint, options) as T;
    }
// }
