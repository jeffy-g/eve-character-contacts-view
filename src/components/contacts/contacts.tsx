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

// 
// for more EVE character "contacts" details see - https://wiki.eveuniversity.org/Contacts
// 

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                imports.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import * as React from "react";

import {
    EVEContactChip,
    EVEContactChipProps
} from "./contact-chip";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type TContactChip = ReturnType<typeof EVEContactChip>;
type TContactChipInstance = ReactInstanceType<typeof EVEContactChip>;
type TChipSizes = EVEContactChipProps["size"];

/**
 * make the EVEContacts state slightly changeable
 */
export interface IEVEContactsAccessor {
    /**
     * change the size of this set of contacts
     * 
     * @param size 
     */
    setSize(size?: TChipSizes): void;
    /**
     * revert deleted contacts
     */
    reset(): void;
}

/**
 * Defines the props for the `EVEContacts` component
 */
export type EVEContactsPops = {
    /**
     * 
     */
    contacts: EVEContact[];
    /**
     * 
     */
    labels: EVEContactLabel[];
    /**
     * 
     */
    characterData: EVECharacterData;

    /**
     * Set the size of the chip component.  
     * can select "small" or "medium"
     */
    size?: TChipSizes;
    /**
     * 
     */
    accessor?: IEVEContactsAccessor;
};

/**
 * Defines the state used inside the `EVEContacts` component
 */
type TEVEContactsState = {
    /**
     * use for reset state, also revert removed contacts to first state
     */
    reset: number;
    /**
     * can select "small" or "medium"
     * @see EVEContactsPops["size"]
     */
    currentSize: TChipSizes;
    /**
     * currently rendered chip components
     */
    elements: TContactChip[];
};

// /**
//  * this feature will be remove
//  * @deprecated
//  */
// const eveContactsMap: StringMap<EVEContact[]> = {};
// /**
//  * this feature will be remove
//  * 
//  * @param character_id 
//  * @param contancts 
//  * @deprecated
//  */
// const cacheContacts = (character_id: EVEId, contancts: EVEContact[]) => {
//     let map = eveContactsMap[character_id];
//     if (!map) {
//         map = [] as EVEContact[];
//     }
//     eveContactsMap[character_id] = map.concat(contancts);
//     // console.log(eveContactsMap);
// }


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * mimics the `setState` method of `React.Component`
 * 
 * @param state 
 */
function useSetState<T extends {}>(state: Partial<T> = {}) {
    const [cacheState, update] = React.useState<T>(state as T);
    const merge = (newState: Partial<T>) => {
        update(
            (prev: T) => ({ ...prev, ...newState })
        );
    };
    return [cacheState, merge] as [T, typeof merge];
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                       class or namespace declare.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * + normally, this component use as each standing group.  
 *   however,  can mix different standing contacts.
 * 
 * @param props 
 */
const EVEContacts = (props: EVEContactsPops) => {

    const { contacts, labels, characterData: { character_id }, size, accessor } = props;
    // DEVNOTE: cache contacts of character_id
    // cacheContacts(character_id, contacts);

    const [state, setState, refElements] = useEVEContactsState(size);
    // const deleter = (instance: TContactChipInstance) => { // fix closure problem at "instance" parameter
    const deleter = (characterId?: string) => {
        if (characterId === void 0) {
            console.log("characterId is undefined...");
            return;
        }
        console.log("_EVEContacts::deleter");
        const elements = refElements.current as TContactChipInstance[];
        const nid = parseInt(characterId);
        const index = elements.findIndex(
            (e) => e.props.contact.contact_id === nid
        );
        if (index !== -1) {
            // const e =
            elements.splice(index, 1);
            // console.log(e, elements, instance);
            setState({ elements });
        }
    };
    // clickHandler.name = "clickHandler"; // runtime error!
    /* eslint-disable */
    const onDeleteHandler = React.useCallback((e: React.MouseEvent) => {
        const character_id = e.currentTarget.parentElement!.dataset.cid;
        deleter(character_id);
    }, []);
    /* eslint-enable */

    const shiftSize = (size: TChipSizes) => {
        console.log("_EVEContacts::shiftSize");
        const elements = refElements.current;
        const nextElements: TContactChip[] = [];
        for (let index = 0, end = elements.length; index < end;) {
            const e = elements[index];
            nextElements[index++] = React.cloneElement(e, { size });
        }
        setState({
            currentSize: size,
            elements: nextElements
        });
    };

    // component.didmount
    didMountOrReset(
        character_id, state,
        contacts, labels,
        setState, onDeleteHandler
    );
    // setup
    setUpAccessor(
        state, shiftSize, setState, accessor
    );

    return <>
        {refElements.current}
    </>;
};

/**
 * 
 * @param initialSize 
 */
function useEVEContactsState(initialSize: TEVEContactsState["currentSize"]) {
    const refElements = React.useRef<TContactChip[]>(null as unknown as TContactChip[]);
    const [state, setState] = useSetState<TEVEContactsState>({
        reset: 0,
        currentSize: initialSize,
        elements: null as unknown as TContactChip[],
    });
    // DEVNOTE: need always assign as reference for util functions closure
    refElements.current = state.elements;

    return [state, setState, refElements] as [
        TEVEContactsState, typeof setState, typeof refElements
    ];
}

/**
 * 
 * @param character_id 
 * @param state 
 * @param contacts 
 * @param labels 
 * @param setState 
 * @param onDeleteHandler 
 */
function didMountOrReset(
    character_id: EVEId, state: TEVEContactsState,
    contacts: EVEContact[], labels: EVEContactLabel[],
    setState: TStdFunction, onDeleteHandler: TStdFunction
) {
    /* eslint-disable */
    // component.didmount
    React.useEffect(() => {
        console.log("_EVEContacts::didMountOrReset, reset: %s", state.reset);

        let index = 0;
        const elements: TContactChip[] = [];
        for (const contact of contacts) {
            // const chip = <EVEContactChip
            //     key={contact.contact_id}
            //     size={state.currentSize}
            //     contact={contact}
            //     labelData={labels}
            //     onDelete={(e: React.MouseEvent) => {
            //         deleter(chip);
            //     }} // also this code can works
            //     data-cid={contact.contact_id}
            // />;
            // elements[index++] = chip;
            elements[index++] = <EVEContactChip
                key={contact.contact_id}
                size={state.currentSize}
                contact={contact}
                labelData={labels}
                onDelete={onDeleteHandler}
                data-cid={contact.contact_id}
            />;
        }
        setState({ elements });
    }, [character_id, state.reset]);
    /* eslint-enable */
}

/**
 * 
 * @param state 
 * @param shiftSize 
 * @param setState 
 * @param accessor 
 */
function setUpAccessor(
    state: TEVEContactsState,
    shiftSize: TStdFunction, setState: TStdFunction,
    accessor?: IEVEContactsAccessor,
) {
    /* eslint-disable */
    React.useEffect(() => {
        // to do at mount time
        let resetor = state.reset;
        if (accessor && !accessor.setSize) {
            accessor.setSize = size => {
                shiftSize(size);
            };
            accessor.reset = () => {
                setState({ reset: ++resetor });
            };
        }
        // at unmount
        return () => {
            if (accessor) {
                delete (accessor as any).setSize;
                delete (accessor as any).reset;
            }
        };
    }, [accessor]);
    /* eslint-enable */
}

export default EVEContacts;
