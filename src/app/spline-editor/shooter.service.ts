import { Injectable } from '@angular/core';
import { ShotInterface } from './shot.interface';

export interface arrayMapInterface {distances: number[], topSpeeds: number[], bottomSpeeds: number[]}

@Injectable({
  providedIn: 'root'
})
export class ShooterService {
    collection: ShotInterface[] | undefined;
    arrayMap: arrayMapInterface = { distances: [], topSpeeds: [], bottomSpeeds: []};
    presets: any;

    constructor(
    ) { }

    private isArrayMapValid(): boolean {
        return Object.entries(this.arrayMap).map(([ k, v ]) => v.length).every((v, i, a) => i === 0 || v === a[i - 1]);
    }

    loadArrayMap() {
        this.arrayMap.distances = (localStorage.getItem("distances") ?? "0,1,2.2,2.7,3.6,4.9,5.5,6.4").split(',').map(Number);
        this.arrayMap.topSpeeds = (localStorage.getItem("topSpeeds") ?? "4.5,4.7,4.1,25.1,40.1,65.1,86.4,125").split(',').map(Number);
        this.arrayMap.bottomSpeeds =  (localStorage.getItem("bottomSpeeds") ?? "51.1,60.7,102.1,90.1,90.1,90.1,90.1,95").split(',').map(Number);
        // this.arrayMap.distances = (localStorage.getItem("distances") ?? "0,1,2.2,2.8,3.6,4.9,6.3").split(',').map(Number);
        // this.arrayMap.topSpeeds = (localStorage.getItem("topSpeeds") ?? "4.5,4.7,4.1,35.3,40.1,65.1,130").split(',').map(Number);
        // this.arrayMap.bottomSpeeds =  (localStorage.getItem("bottomSpeeds") ?? "51.1,60.7,102.1,95.1,95.1,95.1,90.1").split(',').map(Number);
    }

    storeArrayMap() {
        if(!this.isArrayMapValid()) { return; }
        localStorage.setItem("distances", this.arrayMap.distances!.join(','));
        localStorage.setItem("topSpeeds", this.arrayMap.topSpeeds!.join(','));
        localStorage.setItem("bottomSpeeds", this.arrayMap.bottomSpeeds!.join(','));
    }

    loadCollection() {
        this.loadArrayMap();
        if(!this.isArrayMapValid()) { return; }
        const
            objData = this.arrayMap,
            keys: {[key:string]: string} = { distances: 'distance', topSpeeds: 'topSpeed', bottomSpeeds: 'bottomSpeed'};
        this.collection = Object
            .entries(objData)
            .reduce((r: ShotInterface[], [key, array]) => array.map((v: number, i: number) => ({ ...r[i], [keys[key]]: v  })), []);
    }

    storeCollection() {
        if(!this.isArrayMapValid()) { return; }
        this.arrayMap = {
            distances: this.collection!.reduce((p, c: ShotInterface) => [...p, c.distance], [] as number[]),
            topSpeeds: this.collection!.reduce((p, c: ShotInterface) => [...p, c.topSpeed!], [] as number[]),
            bottomSpeeds: this.collection!.reduce((p, c: ShotInterface) => [...p, c.bottomSpeed!], [] as number[]),
        };
        this.storeArrayMap();
    }

    loadPreset(key: string) {
        this.loadPresets();
        return this.presets[key];
    }

    savePreset(key: string, value: arrayMapInterface) {
        this.presets![key] = value;
        localStorage.setItem('presets', JSON.stringify(this.presets));
    }
    
    loadPresets() {
        this.presets = JSON.parse(localStorage.getItem('presets') || '{}');
    }

    savePresets() {
        localStorage.setItem('presets', JSON.stringify(this.presets));
    }
    
}