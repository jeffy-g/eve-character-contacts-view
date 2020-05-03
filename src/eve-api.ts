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
// - - - - useImplicitAuth - - - -
// https://login.eveonline.com/v2/oauth/authorize/?response_type=token&redirect_uri=<redirect_uri>&client_id=<client_id>&scope=esi-characterstats.read.v1&state=login
import * as util from "./util";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * modify from SSOVerifyResponse
 */
export type SSOVerifyResult = {
    /** EVE character ID. */
    character_id: number;
    /** EVE character name. */
    name: string;
    /** ESI scopes. */
    scopes: string[];
    /** unused. (Especially not necessary data */
    type: string;
    /** unused. (Especially not necessary data */
    characterOwnerHash: string;
};
/*
{
  "scp": [
    "esi-assets.read_assets.v1",
    "esi-bookmarks.read_character_bookmarks.v1",
    ...
  ],
  "jti": "2761dc47-4355-466c-ab6f-1df84720c320",
  "kid": "JWT-Signature-Key",
  "sub": "CHARACTER:EVE:94892413",
  "azp": "cec4e98a77c84b09a6a174573fa12fac",
  "name": "annony mouse",
  "owner": "moh0x659OHKs+SqpeXqPLr3b7Ss=",
  "exp": 1548351381,
  "iss": "login.eveonline.com"
}
*/
export type EVEJWTData = {
    /** esi scopes. */
    scp: string[];
    /** uuid of ? */
    jti: string;
    /** jwt type (?) */
    kid: string;
    /** contains EVE character ID. (e.g - "CHARACTER:EVE:<character_id>") */
    sub: string;
    /** Application client ID. */
    azp: string;
    /** EVE character name. */
    name: string;
    /** owner hash. */
    owner: string;
    /** expire date as 1/1000. (UNIX timestamp */
    exp: number;
    /** issure host name. (?) */
    iss: string;
};


//
// - - - enable debug log? - - -
//
const DEBUG = 0;

const eve_auth_base = "https://login.eveonline.com/v2/oauth/authorize/";

const client_id = "d25fb85d73fe4f65a0a558d8f345e74d";
// TODO: where do you want to fix redirect_uri?
// https://<codesandboxId>.codesandbox.io/callback/dummy.html
const redirect_uri = "https://znqnn457lm.codesandbox.io/callback/dummy.html";

const debugLog = (tag: string, args?: any) => {
    console.log(`${tag}, authWindow:`, authWindow, args);
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let authWindow: Window | null = null;
let onAuthorizeSuccess: TAuthorizationCallback | null;
/**
 *
 */
const closeHandler = (/* e?: Event */): void => {
    DEBUG && debugLog("closeHandler:: enter");
    if (authWindow !== null) {
        authWindow.close();
        authWindow = null;
    }
};
// DEVNOTE: cleanup beforeunload
window.addEventListener(
    "beforeunload", closeHandler, { once: true }
);
/** for auth process guard. */
let guardCounter = 0;

/**
 *
 * @param url
 * @param sso
 * @returns `true` if authentication process started successfully, otherwise `false`
 */
function handleCallbackResponse(url: string): boolean {
    if (guardCounter > 0) {
        DEBUG && console.log("handleCallbackResponse::running!!", guardCounter);
        return false;
    }

    let matches = /access_token=([^&]+)/.exec(url);
    const access_token = (matches && matches[1]) || void 0;
    matches = /\?error=(.+)$/.exec(url);
    const error = (matches && matches[1]) || void 0;

    if (access_token || error) {
        closeHandler();
    }

    if (access_token) {
        guardCounter++;
        DEBUG && console.log(
            "handleCallbackResponse:: got access_token, guardCounter:", guardCounter
        );
        onAuthorizeSuccess && onAuthorizeSuccess(access_token);
        return true;
    } else if (error) {
        alert(`Failed to authorize your character, error=${error}\nplease try again.`);
    }

    return false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                       class or namespace declare.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const AuthEventMarshaller = new class {

    private listening = false;

    private _handleMessage = (e: MessageEvent): void => {
        DEBUG && debugLog("AuthEventMarshaller::_handleMessage enter", e);
        const authCallbackUrl = e.data as string;
        if (typeof authCallbackUrl === "string" && handleCallbackResponse(authCallbackUrl)) {
            DEBUG && console.log("authorize process running...");
            window.removeEventListener("message", this._handleMessage, false);
            this.listening = false;
        }
    };

    listen(callback: TAuthorizationCallback): void {
        DEBUG && debugLog(`AuthEventMarshaller::listen enter`, this);
        if (!this.listening) {
            DEBUG && console.log("initializeing message event...");
            onAuthorizeSuccess = callback;
            window.addEventListener("message", this._handleMessage, false);
            this.listening = true;
        }
    }
}();

/**
 * SSO v2 `accessToken` contains json data as base64 encoded.
 *
 * @param {string} accessToken
 * @returns {SSOVerifyResult} modified or convert from `JWT` data.
 */
export const verify = (accessToken: string): SSOVerifyResult => {
    const data = atob(accessToken.split(".")[1]);
    const jwt: EVEJWTData = JSON.parse(data);
    return {
        character_id: parseInt(jwt.sub.split(":")[2], 10),
        name: jwt.name,
        scopes: jwt.scp,
        type: jwt.kid,
        characterOwnerHash: jwt.owner
    } as SSOVerifyResult;
};
/**
 *
 * see {@link https://eveonline-third-party-documentation.readthedocs.io/en/latest/sso/implicitflow.html Implicit Flow}
 *
 * Using the implicit workflow is very easy
 *
 *  - you simply redirect the user to the authorization endpoint, including your `client_id`, `redirect_uri` and setting `response_type` to `token`
 *
 */
export const createAuthUrl = (scopes: string[]) => {
    return `${eve_auth_base}?response_type=token&redirect_uri=${encodeURIComponent(
        redirect_uri
    )}&client_id=${client_id}&scope=${
        encodeURIComponent(scopes.join(" "))
    }&state=login`;
};
/**
 *
 */
export function launchAuthWindow(authUrl: string, callback: TAuthorizationCallback) {
    DEBUG && debugLog("launchAuthWindow:: enter");
    if (authWindow !== null && !authWindow.closed) {
        console.warn("auth window already launched");
        return;
    }

    AuthEventMarshaller.listen(callback);
    // clear guard counter
    guardCounter = 0;
    authWindow = util.openWindow(authUrl, { width: 450, height: 750 });
    // DEVNOTE: cannot work
    // authWindow.addEventListener("load", () => {
    //     DEBUG && debugAuthWindow("authWindow::load");
    //     authWindow!.addEventListener("beforeunload", e => console.error(e));
    // });
    DEBUG && debugLog("launchAuthWindow:: exit");
}
