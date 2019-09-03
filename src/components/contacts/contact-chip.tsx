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


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                       class or namespace declare.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type EVEContactChipProps = {
    contact: EVEContact;
    labelData: EVEContactLabel[];
    // size?: ChipProps["size"];
    // onDelete?: () => void;
} & ChipProps;

/**
 * 
 */
export const EVEContactChip = /* React.memo */(
    ({ contact, labelData, size, ...others }: EVEContactChipProps) => {

        const labels: string[] = [];
        if (Array.isArray(contact.label_ids)) {
            const lids = contact.label_ids;
            labelData.filter(data => {
                return lids.includes(data.label_id);
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
            <Chip classes={classes[size === "small"? "chipSmall": "chip"]} // chip
                data-standing={contact.standing}
                clickable
                label={contact.name}
                avatar={createAvatar(contact.contact_id, contact.contact_type)}
                // // DEVNOTE: currently, height 24px
                // size={size} // enlarge by Avatar image...
                // // event extends React.SyntheticEvent<any, Event>
                // onDelete={onDelete}
                {...others}
            />
        </Tooltip>;
    }
    // , (pp, np) => pp.contact.contact_id === np.contact.contact_id && pp.size === np.size
);
