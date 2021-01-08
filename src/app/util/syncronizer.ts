import { EventEmitter } from "@angular/core";


/**
 * Object used to syncronize components
 * 
 * Think about it like a semaphore adapted to JS asyncrounous world 
 */
export class Syncronizer
{
    // keep tracks of syncs (can only be synced once per name)
    private _tabSync: {[key: string]: boolean} = {};
    // number to sync to
    private _nbToSync: number = 0;
    // number of synced accepted
    private _nbSynced: number = 0;
    
    // to prevent event call redondency sync caller are notified whom has name has synced the syncronizer
    private _syncCall: {[key: string]: boolean} = {};

    // event triggered when sync is called and nbSynced == nbToSync 
    onSyncEvent: EventEmitter<SyncEvent> = new EventEmitter<SyncEvent>();

    // event triggered when syncronizer unsync
    onUnsyncEvent: EventEmitter<SyncEvent> = new EventEmitter<SyncEvent>();


    constructor(nbToSync: number)
    {
        this._nbToSync = nbToSync;
    }

    /**
     * Sync function
     * @param name optional param to identify where sync is called from
     */
    public sync(name)
    {
        // if name is not falsy
        if(name)
        {
            // check if it is not synced
            if(this._tabSync[name] == undefined || this._tabSync[name] == false)
            {
                // if not synced then sync
                this._nbSynced += 1;
                // mark name as synced
                this._tabSync[name] = true;
                
                // mark name in syncCall
                this._syncCall[name] = true;
            }

            // if syncronizer is synced
            if(this.synced)
            {
                // emit event with syncCalled and actual sync caller
                this.onSyncEvent.emit({...this._syncCall, syncer: name});

                // reset syncCall
                this._syncCall = {};
            }
        }
        else
        {
            throw new Error(`name : '${name}' not unvalid`);
            // this._nbSynced += 1;

            // if(this.synced)
            // {
            //     this.syncEvent.emit({...this._syncCall});
            // }
        }
    }

    /**
     * unsync Function
     * @param name 
     */
    public unSync(name: string)
    {
        // if name is not falsy
        if(name)
        {
            // if name exists and is synced   
            if(this._tabSync[name] === true)
            {
                // if syncronizer is synced
                if(this.synced)
                {
                    // emit unsynced event
                    this.onUnsyncEvent.emit(null);
                }

                // update nbSynced and tab
                this._nbSynced -= 1;
                this._tabSync[name] = false;
            }

            else
            {
                console.warn('tried to unsync an untracked name')
            }
        }
        else
        {
            throw new Error(`name : '${name}' not unvalid`);
            // this._nbSynced -= 1;
        }
    }


    public get synced()
    {
        return this._nbSynced == this._nbToSync;
    }
}

export interface SyncEvent
{[key: string]: boolean | string; syncer: string};