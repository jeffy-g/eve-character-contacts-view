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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                      module vars, functions.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// const unity = (): number => {
//     return ~~(Math.random() * 255);
// };

export const template = (literals: TemplateStringsArray, ...keys: any[]) => {
    return (...values: any[]) => {
        const map = values[values.length - 1] || {};
        let result = literals[0];
        for (let i = 0, len = keys.length; i < len;) {
            const key = keys[i];
            const value = Number.isInteger(key) ? values[key] : map[key];
            result += value + literals[++i];
        }
        return result;
        //     const result = [strings[0]];
        //     keys.forEach(function(key, i) {
        //       const value = Number.isInteger(key) ? values[key] : dict[key];
        //       result.push(value, strings[i + 1]);
        //     });
        //     return result.join('');
    };
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                    class or namespace declare.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// namespace Util {
// /**
//  * ensure deeeep copy.
//  *
//  * @param object copy from this object.
//  */
// export function deepClone<T>(object: T): T {
//     return JSON.parse(JSON.stringify(object)) as T;
// }
// /**
//  * maybe detect "iPhone" or "Android" mobile phone...
//  *
//  * @export
//  */
// export function isSmartPhone(): boolean {
//     const ua = navigator.userAgent;
//     return ua.includes("Mobile") && (ua.includes("Android") || ua.includes("iPhone"));
// }

// /**
//  *
//  * @export
//  * @returns {[number, number, number]}
//  */
// export function randomRGBColor(): [number, number, number] {
//     return [Math.random(), Math.random(), Math.random()];
// }
// /**
//  *
//  * @export
//  * @returns {number}
//  */
// export function randomHexColor(): number {
//     return (unity() << 16) | (unity() << 8) | unity();
// }
// /**
//  *
//  * @export
//  * @param {number} alpha
//  * @returns {string}
//  */
// export function randomCSSRgba(alpha: number): string {
//     if (alpha < 0) {
//         alpha = 0;
//     } else if (alpha > 1) {
//         alpha = 1;
//     }
//     return `rgba(${unity()}, ${unity()}, ${unity()}, ${alpha})`;
// }
/**
 * Set top level window to the center position on the screen.
 *
 * @param width
 * @param height
 */
export function adjustCenterPosition(width: number, height: number) {
    const left = window.outerWidth / 2 - width / 2;
    const top = window.outerHeight / 2 - height / 2;
    return { left, top };
}

/**
 * depending on the execution environment, the open window type changes.
 * ```
 * WebBrowser: (link: string) => Window
 * ```
 * @param link ⚠️
 * @param [size] default: width=800, height=600
 */
export const openWindow = (
    link: string,
    size?: { width?: number; height?: number },
    target: string = "eve-auth-window"
): Window | null => {
    const { width = 800, height = 600 } = size || {};
    const p = adjustCenterPosition(width, height);
    return window.open(
        link,
        target,
        `width=${width},height=${height},top=${p.top},left=${p.left}`
    );
};
// }

// export default Util;
