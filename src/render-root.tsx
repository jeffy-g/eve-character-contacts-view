// <reference path="./global.d.ts"/>
import * as React from "react";

import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

import EVEContacts from "./components/contacts/contacts";
import IdsToNames from "./eve/ids-to-names";


const resolver = new IdsToNames();
//
// divide Contacts
//
const filterContacts = (contacts: EVEContact[], statning: number) => {
    const result = [] as EVEContact[];
    for (const c of contacts) {
        c.standing === statning && result.push(c);
    }
    return result;
};
const contactComparator = (a: EVEContact, b: EVEContact) => {
    return a.name.localeCompare(b.name);
};
/**
 * #### divede by standing
 * 
 * ```
   10.0  // Excellent :blue
    5.0  // Good :lightblue
    0.0  // Neutral :whitesmoke
   -5.0  // Bad :orange
  -10.0  // Terrible :red
 
  ```
 * 
 * @param contacts 
 * @returns divided EVEContact[] arrays like `[excellent, good, neutral, bad, terrible]`
 */
const divideContacts = (contacts: EVEContact[]) => {
    const excellent = filterContacts(contacts,  10).sort(contactComparator);
    const good      = filterContacts(contacts,  5).sort(contactComparator);
    const neutral   = filterContacts(contacts,  0).sort(contactComparator);
    const bad       = filterContacts(contacts, -5).sort(contactComparator);
    const terrible  = filterContacts(contacts, -10).sort(contactComparator);
    // const excellent = contacts.filter(c => c.standing === 10).sort(contactComparator);
    // const good = contacts.filter(c => c.standing === 5).sort(contactComparator);
    // const neutral = contacts.filter(c => c.standing === 0).sort(contactComparator);
    // const bad = contacts.filter(c => c.standing === -5).sort(contactComparator);
    // const terrible = contacts.filter(c => c.standing === -10).sort(contactComparator);
    return [
        excellent,
        good,
        neutral,
        bad,
        terrible,
    ];
};

export type TRenderParams = {
    contacts: EVEContact[];
    labels: EVEContactLabel[];
};

export const renderEVEComponents: TEVEComponentRenderer2<TRenderParams> = async (
    params: TRenderParams,
    characterData: EVECharacterData
) => {

    const { contacts, labels } = params;

    const charOnly = contacts.filter(c => c.contact_id > 4000000);
    const charIds = charOnly.map(c => c.contact_id);

    /* - - - resolve names - - - */
    // resolver.addIds(charIds);
    // for (const charId of charIds) {
    //     if (resolver.addId(charId) === 1000) {
    //         await resolver.resolve();
    //     }
    // }
    // if (resolver.size() > 0) {
    //     await resolver.resolve();
    // }
    resolver.addIds(charIds);
    await resolver.batchResolve();
    for (const c of charOnly) {
        const unf = resolver.get(c.contact_id);
        unf && (c.name = unf.name);
    }
    /* - - - resolve names - - - */

    console.log(
        JSON.stringify(charIds, null, 2), characterData
    );

    const [
        excellent, good, neutral, bad, terrible
    ] = divideContacts(charOnly);
    const ss = { margin: "4px 0" };
    return <>
        <Typography variant="h5">Excellent</Typography>
        <EVEContacts contacts={excellent} labels={labels} characterData={characterData}/>
        <Divider style={ss}/>
        <Typography variant="h5">Good</Typography>
        <EVEContacts contacts={good} labels={labels} characterData={characterData}/>
        <Divider style={ss}/>
        <Typography variant="h5">Neutral</Typography>
        <EVEContacts contacts={neutral} labels={labels} characterData={characterData}/>
        <Divider style={ss}/>
        <Typography variant="h5">Bad</Typography>
        <EVEContacts contacts={bad} labels={labels} characterData={characterData}/>
        <Divider style={ss}/>
        <Typography variant="h5">Terrible</Typography>
        <EVEContacts contacts={terrible} labels={labels} characterData={characterData}/>
    </>;
};

