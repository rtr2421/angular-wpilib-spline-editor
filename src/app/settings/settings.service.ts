import { Injectable } from '@angular/core';
import { SettingsInterface } from './settings.interface';

export interface arrayMapInterface {distances: number[], topSpeeds: number[], bottomSpeeds: number[]}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
    settings: SettingsInterface = { teamDomain: 'roboRIO-2421-FRC.local' };

    constructor() {
      this.load();
    }

    load() {
      this.settings = JSON.parse(localStorage.getItem("settings") || JSON.stringify(this.settings))
    }

    save() {
      localStorage.setItem("settings", JSON.stringify(this.settings));
    }    
}