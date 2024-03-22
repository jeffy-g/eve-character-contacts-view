// <reference path="./global.d.ts"/>

import * as React from "react";
import { createRoot } from "react-dom/client";

import {
    launchAuthWindow,
    verify, createAuthUrl,
    SSOVerifyResult
} from "./eve-api";
import { renderEVEComponents } from "./render-root";
import * as NsESIClient from "./eve/api/esi-client";

// import "./styles.scss";



const debugLog = (tag: string, args?: any) => {
    console.log(`${tag}, index:`, args);
};

function Welcome() {
    console.log(
        /\n\s+(?=\n)|\s+(?=\n)|`|"(?:[^\\"]|\\[^])*"|'(?:[^\\']|\\[^])*'|\//g.test("")
    );
    return (
        <div className="App">
            <h1>Hello CodeSandbox</h1>
            <h2>Start editing to see some magic happen!</h2>
        </div>
    );
}

let refactRoot: ReturnType<typeof createRoot>;
/**
 *
 */
const renderComponent = (jsx: JSX.Element) => {
    const root = document.getElementById("root")!;
    if (root === null) {
        throw Error("cannot render react components!");
    }
    if (!refactRoot) {
        refactRoot = createRoot(root);
    }
    // if (root.children.length) {
    //     // ReactDOM.unmountComponentAtNode(root);
    //     refactRoot.unmount();
    // }
    refactRoot.render(jsx);
};


//
// - - - enable debug log? - - -
//
const DEBUG = 1;
const sharedESI = NsESIClient.getInstance();
/**
 * @example
 * "/characters/{character_id}/contacts/"
 * "/characters/{character_id}/contacts/labels/"
 * @param accessToken 
 */
const authCallback: TAuthorizationCallback = async accessToken => {
    const verifyData: SSOVerifyResult = verify(accessToken);

    sharedESI.useAccessToken(accessToken);
    const [contacts, labels] = await Promise.all([
        // step 1. get contacts data
        processESI(
            `/characters/${verifyData.character_id}/contacts/`,
            // accessToken
        ),
        // step 2. get label data
        processESI(
            `/characters/${verifyData.character_id}/contacts/labels/`,
            // accessToken
        )
    ]) as [EVEContact[], EVEContactLabel[]];

    DEBUG && console.log(labels);
    // step 3. create eve contacts components
    const root = await renderEVEComponents({ contacts, labels }, verifyData);
    // finally, render to page
    renderComponent(root);
};

const processESI = async <T extends any>(
    /**
     * ESI endpoint replaced parameter
     * 
     * ```
// e.g
"/characters/{character_id}/stats/"
// to
"/characters/9456989/stats/"
```
     */
    endpoint: string,
    // access_token: string,
) => {
    return sharedESI.get<T>(endpoint).then(data => {
        DEBUG && debugLog("esi.get.then:: exit");
        return data as T;
    }).catch(reason => {
        console.warn(reason);
        // DEVNOTE: bad habit, but deceiving typescript
        return reason as T;
    });
};

(() => {
    /**
     * this scope for:
     * @example
     * "/characters/{character_id}/contacts/"
     * "/characters/{character_id}/contacts/labels/"
     * // etc...
     */
    const scopes = ["esi-characters.read_contacts.v1"];
    const init = () => {
        const openAuth = document.getElementById("openAuth")!;
        const darkCheck = document.querySelector(".theme-dark")!;

        openAuth.addEventListener("click", () => {
            const authUrl = createAuthUrl(scopes);
            launchAuthWindow(authUrl, authCallback);
        });
        darkCheck.addEventListener("change", function (this: HTMLInputElement) {
            const method = this.checked ? "add" : "remove";
            document.body.classList[method]("dark");
        });

        // first time is render welcome component
        renderComponent(<Welcome />);

        return !0;
    };
    // console.log(document.readyState);
    (document.readyState === "complete" && init()) ||
        window.addEventListener("load", init, { once: true });
})();
