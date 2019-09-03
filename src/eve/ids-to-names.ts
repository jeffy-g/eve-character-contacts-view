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
 * 
 */
// type UniverseNamesFragment = Pick<EVEUniverseNames, "category"> & Pick<EVEUniverseNames, "name"> & {
type UniverseNamesFragment<T> = {
    name: string;
    /** "station", "solar_system", "structure" */
    category: T;
};

type UniverseNamesFragmentDefault = UniverseNamesFragment<EVEUniverseCategory>;
// type UniverseNamesFragmentLocation = UniverseNamesFragment<"station" | "solar_system" | "structure">;
    
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
     * CAUTION: ~~max id count are __1000__.(limitation by ESI endpoint)  
     *  so need check pushed count.~~
     * 
     * + **above problem is already fixed**
     * 
     * @param typeId any item type_id etc...
     * @returns count of current pushed id
     */
    addId(typeId: number): number {
        if (this.resolving) return -1;
        const ids = this.ids;
        if (typeId > 0 && !ids.includes(typeId) && !unameRegistry[typeId]) {
            return ids.push(typeId);
        }
        return ids.length;
    }
    /**
     * "typeId"s **MUST** available type id.
     * 
     * + If id is duplicated, it is not added.
     * 
     * + also, if type data already exists in data registry, it will not be added.
     * 
     * @param typeIds 
     */
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
        const filtered = [...sids].filter(id => !unameRegistry[id]);
        return (this.ids = filtered).length;
    }

    /**
     * #### resolve ids each 1000 units
     * 
     * query ESI endpoint [/universe/names/](https://esi.evetech.net/ui/#/Universe/post_universe_names) by current pushed ids.
     * 
     * + also, **clear currently added ids** by this method
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
        let newcomer = false;

        if (eveIds.length > 0) {

            !esi && (esi = NsESIClient.getInstance());
            type TEVEUniverseNames = EVEUniverseNames[];
            const promises: Promise<TEVEUniverseNames>[] = [];

            for (
                let ptr = 0, last = 1e3, l = eveIds.length, idx = 0;
                ptr < l;
                ptr = last, last += 1e3
            ) {
                console.log("IdsToNames::resolve.esi.post");

                const task = esi.post<TEVEUniverseNames>("/universe/names/", { body: eveIds.slice(ptr, last) }).then(universes => {
                    console.log("IdsToNames::resolve.esi.post - done");
                    // step 3. register response data to "unameRegistry" then save data.
                    if (universes) {
                        for (const u of universes) {
                            unameRegistry[u.id] = {
                                name: u.name,
                                category: u.category
                            };
                        }
                    }
                }).catch(reason => {
					// universes = void 0;
                    console.log("IdsToNames::resolve.esi.post - failed, range=%s to %s", ptr, last);
                    return reason;
                });

                promises[idx++] = task;
            }

            // wait for all esi request done
            await Promise.all(promises);
            newcomer = true;
        }

        // purge added ids
        eveIds.length = 0;
        this.resolving = false;

        return newcomer;
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
