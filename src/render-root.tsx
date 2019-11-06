// <reference path="./global.d.ts"/>
import * as React from "react";

import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

import EVEContacts, { IEVEContactsAccessor } from "./components/contacts/contacts";
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

const hr = <Divider style={{ margin: "4px 0" }}/>;

// const sizer = {} as IEVEContactsAccessor;
const sizers = [] as IEVEContactsAccessor[];
for (let i = 5; i--;) {
    sizers.push({} as IEVEContactsAccessor);
}
const resetor = () => {
    sizers.forEach(sizer => {
        // sizer.reset();
        requestAnimationFrame(() => sizer.reset());
    });
}

/**
 * chip re-size event handler
 * @param e 
 */
function changeHander(e: React.ChangeEvent<HTMLInputElement>) {
    const newSize = e.currentTarget.value as Parameters<IEVEContactsAccessor["setSize"]>[0];
    // console.log(newSize);
    // sizer.setSize(newSize);
    sizers.forEach(sizer => {
        // sizer.setSize(newSize);
        requestAnimationFrame(() => sizer.setSize(newSize));
    });
}
const SizerRadios = () => {
    // ChipProps["size"]
    const radios = ["small", "medium"].map((token, index) => {
        const buttonId = token + "-sizer-button";
        return <React.Fragment key={index}>
            <input id={buttonId}
                type="radio" name="chip-sizer" className=""
                value={token}
                onChange={changeHander}
                // checked={token === "medium"}
                defaultChecked={token === "medium"}
            />
            <label htmlFor={buttonId}>{token}</label>
        </React.Fragment>;
    });
    return <>{radios}</>;
};

export type TRenderParams = {
    contacts: EVEContact[];
    labels: EVEContactLabel[];
};

export const renderEVEComponents: TEVEComponentRenderer<TRenderParams> = async (
    params: TRenderParams,
    characterData: EVECharacterData
) => {

    const { contacts, labels } = params;
    /**
     * contact_type: "character", "corporation", "alliance", "faction"
     */
    const contactIds = contacts.filter(c => c.contact_id > 4000000);

    /* - - - resolve names - - - */
    resolver.addIds(
        contactIds.map(c => c.contact_id)
    );
    await resolver.resolve();
    for (const c of contactIds) {
        const unf = resolver.get(c.contact_id);
        unf && (c.name = unf.name);
    }
    /* - - - resolve names - - - */
    // console.log(
    //     JSON.stringify(charIds, null, 2), characterData
    // );

    const [
        excellent, good, neutral, bad, terrible
    ] = divideContacts(contactIds);

    return <>
        <SizerRadios/>
        <span style={{ width: 12, display: "inline-block" }}/>
        <button onClick={resetor}>reset</button>
        <Typography variant="h5">Excellent</Typography>
        <EVEContacts contacts={excellent} labels={labels} characterData={characterData} accessor={sizers[0]}/>
        {hr}
        <Typography variant="h5">Good</Typography>
        <EVEContacts contacts={good} labels={labels} characterData={characterData} accessor={sizers[1]}/>
        {hr}
        <Typography variant="h5">Neutral</Typography>
        <EVEContacts contacts={neutral} labels={labels} characterData={characterData} accessor={sizers[2]}/>
        {hr}
        <Typography variant="h5">Bad</Typography>
        <EVEContacts contacts={bad} labels={labels} characterData={characterData} accessor={sizers[3]}/>
        {hr}
        <Typography variant="h5">Terrible</Typography>
        <EVEContacts contacts={terrible} labels={labels} characterData={characterData} accessor={sizers[4]}/>
    </>;
};

