/*
@startuml
class IdsToNames{
  -resolving : boolean
  +addId(typeId: number): number
  +addIds(typeIds: number[]): number
  +resolve(esi?: IESIClient)
  +get(id: string|number): UniverseNamesFragmentDefault
  +getIDs(): number[]
  +size(): number
  +clear(): void
}

interface IBulkIDResolver{

}

IBulkIDResolver <|-- IdsToNames
@enduml
*/
import * as NsESIClient from "./api/esi-client";


/**
 * idb data type.
 */
type UnameRegistry = StringMap<UniverseNamesFragmentDefault>;

/**
 * shared data registry. (singleton
 */
let unameRegistry: UnameRegistry = {};



/**
 * This class persists the data obtained from ESI endpoint /universe/names/
 * 
 * TODO: auto resolve when reached max item(1000) at `addId` or `addIds` method processing.
 */
export default class IdsToNames /* implements IBulkIDResolver */ {

    private resolving: boolean = false;
    constructor(public ids: number[] = []) {}

    /**
     * "typeId" **MUST** available type id.
     * 
     * **excludes already pushed id.**
     * 
     * CAUTION: max id count are __1000__.(limitation by ESI endpoint)  
     *  so need check pushed count.
     * 
     * @param typeId any item type_id etc...
     * @returns count of current pushed id
     */
    addId(typeId: number): number {
        if (this.resolving) return -1;
        const ids = this.ids;
        if (typeId > 0 && !ids.includes(typeId)) {
            return ids.push(typeId);
        }
        return ids.length;
    }
    addIds(typeIds: number[]): number {
        if (this.resolving) return -1;

        // const ids = this.ids;
        // for (const n of typeIds) {
        //     if (n > 0 && !ids.includes(n)) {
        //         ids.push(n);
        //     }
        // }
        // return ids.length;
        const sids = new Set([...this.ids, ...typeIds]);
        return (this.ids = [...sids]).length;
    }
    /**
     * resolve ids each 1000 units
     */
    async batchResolve(esi?: IESIClient) {
        const eveIds = this.ids;
        // has not ids...
        if (eveIds.length === 0) {
            return false;
        }

        // step 1. filter pushed ids by unameRegistry.
        const unknownIds = eveIds.filter((n/* , idx, self */) => {
            return unameRegistry[n] === void 0;// && self.indexOf(n) === idx;
        });

        // 8/14/2018
        this.resolving = true;
        let newEntries = false;
        // purge added ids
        eveIds.length = 0;

        if (unknownIds.length > 0) {
            !esi && (esi = NsESIClient.getInstance());
            for (
                let ptr = 0, last = 1e3, l = unknownIds.length;
                ptr < l;
                ptr = last, last += 1e3
            ) {
                let universes: EVEUniverseNames[] | undefined;
                // try {
                //     console.log("IdsToNames::resolve.esi.post");
                //     // v2, v3
                //     universes = await esi.post<typeof universes>("/universe/names/", { body: unknownIds.slice(ptr, last) });
                //     console.log("IdsToNames::resolve.esi.post - done");
                // } catch (e) {
                //     this.resolving = false;
                //     console.log("IdsToNames::resolve.esi.post - fail");
                //     throw e;
                // }
                console.log("IdsToNames::resolve.esi.post");
                await esi.post<typeof universes>("/universe/names/", { body: unknownIds.slice(ptr, last) }).then(data => {
                    universes = data;
                    console.log("IdsToNames::resolve.esi.post - done");
                }).catch(reason => {
					universes = void 0;
                    console.log("IdsToNames::resolve.esi.post - failed, range=%s to %s", ptr, last);
                    return reason;
                });
                // step 3. register response data to "unameRegistry" then save data.
                if (universes) {
                    for (const u of universes) {
                        unameRegistry[u.id] = {
                            name: u.name,
                            category: u.category
                        };
                    }
                    newEntries = true;
                }
            }
        }

        this.resolving = false;
        return newEntries;
    }

    /**
     * query ESI endpoint [/universe/names/](https://esi.evetech.net/ui/#/Universe/post_universe_names) by current pushed ids.
     * 
     * + NOTE: this method purge added ids internally.
     * 
     * @param esi use request with this esi instance.(?)
     * @returns when requested returns true.
     */
    async resolve(esi?: IESIClient) {
        const eveIds = this.ids;
        // has not ids...
        if (eveIds.length === 0) {
            return false;
        }

        // 8/14/2018
        this.resolving = true;
        let newEntries = false;

        // step 1. filter pushed ids by unameRegistry.
        const unknownIds = eveIds.filter((n/* , idx, self */) => {
            return unameRegistry[n] === void 0;// && self.indexOf(n) === idx;
        });
        // purge added ids
        eveIds.length = 0;
        // this.clear();

        if (unknownIds.length > 0) {
            // step 2. do ESI endpoint "universe/names".
            !esi && (esi = NsESIClient.getInstance());
            let universes: EVEUniverseNames[];
            try {
                console.log("IdsToNames::resolve.esi.post");
                // v2, v3
                universes = await esi.post<typeof universes>("/universe/names/", { body: unknownIds });
                console.log("IdsToNames::resolve.esi.post - done");
            } catch (e) {
                this.resolving = false;
                console.log("IdsToNames::resolve.esi.post - fail");
                throw e;
            }
            // step 3. register response data to "unameRegistry" then save data.
            if (universes) {
                for (const u of universes) {
                    unameRegistry[u.id] = {
                        name: u.name,
                        category: u.category
                    };
                }
                newEntries = true;
            }
        }

        this.resolving = false;
        return newEntries;
    }

    /**
     * MUST call after resolve method.
     * 
     * NOTE: return reference is shallow copy.
     * 
     * @param id item type_id etc...
     * 
     * @returns kind of `UniverseNamesFragmentDefault` or `undefined`
     */
    // FIXED: "get" method returns direct reference object.
    get(id: EVEId): Undefable<UniverseNamesFragmentDefault> {
        const uname = unameRegistry[id];
        return uname === void 0 ? void 0 : Object.assign({}, uname);
    }
    /**
     * get current ids.
     */
    getIDs(): number[] {
        return this.ids;
    }
    /**
     * @returns count of current pushed id.
     */
    size(): number {
        return this.getIDs().length;
    }
    /**
     * purge pushed ids.
     */
    clear(): void {
        if (this.resolving) {
            console.log("running resolve process, so cannot clear.");
            return;
        }
        this.ids.length = 0;
    }
}
