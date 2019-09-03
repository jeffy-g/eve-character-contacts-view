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
//                                basic types.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
declare type StringMap<T> = {
    [property: string]: T | undefined;
};


/**
 * can be `undefined`.
 */
type Undefable<T> = T | undefined;
/**
 * can be `null` or `undefined`.
 */
type Nullable<T> = Undefable<T> | null;
/**
 * can be `null`.
 */
type NullOr<T> = T | null;
// /**
//  * get property type.
//  */
// type TypeOf<T, K extends keyof T> = T[K];
// // -> same as like SkillPlanDataType["plans"]

/** omit property K from type T. */
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * pickup public fields and methods from `typescript` class.
 * 
 * shorthand of:
 * ```ts
Pick<T, keyof T>;
```
 * 
 * NOTE: cannot listed `protected` and `private` modifier
 */
type InterfaceType<T> = {
  [P in keyof T]: T[P];
};

/**
 * http query parameter types. (maybe not enough.
 */
type QueryValueTypes = string | number | boolean | Date;

// or
// type TInterfaceType<T> = Pick<T, keyof T>;
/**
 * extract react component instance type.
 */
type ReactInstanceType<
  T extends React.ElementType<any>,
  P = React.ComponentPropsWithRef<T>
> = React.ComponentElement<P, React.Component<P>>;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                           EVE ESI data types etc.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
declare type EVEId = number | string;

type EVECharacterData = {
    /** EVE character ID. */
    character_id: EVEId;
    /** EVE character name. */
    name: string;
};

type TEVEComponentRenderer<T> = (
  jsonData: T,
  characterData: EVECharacterData
) => Promise<JSX.Element>;

type TAuthorizationCallback = (accessToken: string) => void;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// ESI endpoint definition used in this package
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * maybe, i think this only use "universe/**" endpoint.
 */
type EVEUniverseCategory = "alliance" | "character" | "constellation" | "corporation" | "inventory_type" | "region" | "solar_system" | "station" | "faction";

/**
 * universe/names
 */
type EVEUniverseNames = {
    /** e.g - "character" */
    category: EVEUniverseCategory;
    /** e.g - 9xx37xxx */
    id: string;
    /** e.g - "ynnot erdna" */
    name: string; 
};

/**
 * /characters/{character_id}/contacts/
 * ```
[
  {
    "contact_id": 93186694,
    "contact_type": "character",
    "is_watched": true,
    "label_ids": [
      16
    ],
    "standing": 0
  }, ...
]
```
 * This route is cached for up to 300 seconds
 * 
 * maxItems: 1024
 * 
 * DEVNOTE: In the explanation of EVE swagger UI, the number of items per page is described as 1024, but in fact it looks like (now) 200! ! !
 */
type EVEContact = {
    /**
     * int32. maybe character_id or ...
     */
    contact_id: number;
    contact_type: "character" | "corporation" | "alliance" | "faction";
    /** float, -10 to 10 */
    standing: number;

    is_blocked?: boolean;
    is_watched?: boolean;
    /** maxItems: 63 */
    label_ids?: number[];

    /** extra property */
    name: string;
};

/**
 * /characters/{character_id}/contacts/labels/
 * ```
[
  {
    "label_id": 65536,
    "label_name": "EVE developer"
  },
  {
    "label_id": 1,
    "label_name": "mission XXX"
  },
  {
    "label_id": 2,
    "label_name": "the thief"
  }, ...
]
```
 * This route is cached for up to 300 seconds
 * 
 * maxItems: 64
 */
type EVEContactLabel = {
    /** int64, 1, 2, 4, 8, 16, ... (2 ** 64)? */
    label_id: number;
    label_name: string;
};
