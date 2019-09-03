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

// @meterial-ui components
import Avatar from "@material-ui/core/Avatar";
import Chip, { ChipProps } from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
// import Icon from "@material-ui/core/Icon";

import * as util from "../../util";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                            constants, types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*
//
// [standing color]:
//
//   10.0 (Excellent :blue)
//   5.0  (Good :lightblue)
//   0.0  (Neutral :whitesmoke)
//  -5.0  (Bad :orange)
// -10.0  (Terrible :red)
//
*/
// const CHIP_SIZE = 28;
// const styles: StringMap<React.CSSProperties> = {
//     chip: {
//         height: CHIP_SIZE,
//         margin: 2,
//     },
//     avatar: {
//         width: CHIP_SIZE,
//         height: CHIP_SIZE,
//         "marginRight": -6,
//     }
// };
const classes: StringMap<StringMap<string>> = {
    chip: {
        root: "eve-character-chip"
    },
    chipSmall: {
        root: "eve-character-chip small"
    },
    avatar: {
        root: "chip-avatar",
        // img: "small"
    }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * DEVNOTE: character image type are "jpg".
 * @param kinds 
 * @param id 
 */
const getAvatarImageUri = (
    kinds: string,
    id: number,
    // extension: "png" | "jpg"
): string => {
    const extension = kinds === "character" ? "jpg" : "png";
    return `https://image.eveonline.com/${kinds}/${id}_32.${extension}`;
};
/**
 * 
 * @param id 
 * @param kinds "character" | "corporation" | "alliance" | "faction"
 */
const createAvatar = (
    id: number,
    kinds: "character" | "corporation" | "alliance" | "faction"
): ReactInstanceType<typeof Avatar> => {
    // type AvatarProops = React.ComponentPropsWithoutRef<typeof Avatar>;
    // const props: AvatarProops = {
    // };
    // const ext = type === "character" ? "jpg" : "png";
    return <Avatar
        classes={classes.avatar}
        src={getAvatarImageUri(kinds, id)}
        // sizes=""
    />;
};

type EVEContactChipProps = {
    contact: EVEContact;
    labelData: EVEContactLabel[];
    size?: ChipProps["size"];
    onDelete?: () => void;
};
/**
 * 
 */
const EVEContactChip = React.memo(
    ({ contact, labelData, size, onDelete }: EVEContactChipProps) => {

        const labels: string[] = [];
        if (Array.isArray(contact.label_ids)) {
            labelData.filter(data => {
                return contact.label_ids!.includes(data.label_id);
            }).forEach(data => labels.push(data.label_name));
        }

        return <Tooltip title={createTitle(contact) + `labels: [${labels.join(", ")}]`}
            // PopperProps={{ style: { whiteSpace: "pre", fontSize: "1.5rem", width: "auto" } }} -> this were meaningless...
            classes={{ tooltip: "contact-tooltip" }}
            // placement="top-start"
            // apply style to root element.
            // style={{ maxWidth: "none" }}
            disableFocusListener
        >
            <Chip classes={classes.chipSmall} // chip
                data-standing={contact.standing}
                clickable
                avatar={createAvatar(contact.contact_id, contact.contact_type)}
                // DEVNOTE: currently, height 24px
                size={size} // enlarge by Avatar image...
                label={contact.name}
                // event extends React.SyntheticEvent<any, Event>
                onDelete={onDelete}
                // title={createTitle(contact)}
            />
        </Tooltip>;
    },
    (pp, np) => pp.contact.contact_id === np.contact.contact_id
);

/**
 * 
 */
const eveContactsMap: StringMap<EVEContact[]> = {};

// const handleDelete = (e: any) => {
//     e.persist();
//     console.log(e);
// };

/**
 * 
 */
const createTitle = util.template`\
contact_id: ${"contact_id"}
contact_type: ${"contact_type"}

is_blocked?: ${"is_blocked"}
is_watched?: ${"is_watched"}

standing: ${"standing"}
label_ids: ${"label_ids"}
`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                       class or namespace declare.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * 
 * @param props 
 */
const EVEContacts = (
    props: {
        contacts: EVEContact[],
        labels: EVEContactLabel[],
        characterData: EVECharacterData
    }
) => {
    type TContactChip = ReturnType<typeof EVEContactChip>;
    const { contacts, labels, characterData: { character_id } } = props;
    // DEVNOTE: cache contacts of character_id
    eveContactsMap[character_id] = contacts;
    // console.log(eveContactsMap);
    // const elementsRef = React.useRef<TContactChip[]>();
    /* eslint-disable */
    const elements = React.useMemo(() => {
        console.log("_EVEContacts::useMemo");
        const elements: TContactChip[] = [];
        for (const contact of contacts) {
            // const standing = contact.standing || void 0;
            const chip = <EVEContactChip
                key={contact.contact_id}
                size="small"
                contact={contact}
                labelData={labels}
                onDelete={() => clickHandler(chip)}
            />;
            elements.push(chip);
        }
        return elements;
    }, [character_id]);
    /* eslint-enable */

    let [refElements, updateElementsIfNotSameRef] = React.useState(elements);
    const clickHandler = (instance: ReactInstanceType<typeof EVEContactChip>) => {
        // console.log("_EVEContacts::clickHandler");
        const index = refElements.findIndex(e => e === instance);
        const e = refElements.splice(index, 1);
        console.log(e, refElements, instance);
        updateElementsIfNotSameRef(refElements.concat());
        // updateElementsIfNotSameRef(prev => {
        //     const index = prev.findIndex(e => e === instance);
        //     const e = prev.splice(index, 1);
        //     console.log(e, prev, instance);
        //     return prev.concat();
        // });
    };
    // clickHandler.name = "clickHandler"; // runtime error!

    // const clickHandler = React.useCallback((instance: ReactInstanceType<typeof EVEContactChip>) => {
    //     // console.log("_EVEContacts::useCallback");
    //     const index = refElements.findIndex(e => e === instance);
    //     const e = refElements.splice(index, 1);
    //     console.log(e, refElements, instance);
    //     updateElementsIfNotSameRef(refElements.concat());
    // }, []); // eslint-disable-line

    return <>
        {refElements}
    </>;
};

export default EVEContacts;
