import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { wpilibService as WPILibService } from '../wpilib.service';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  get settings() {
    return this.settingsService.settings;
  }

  set settings(value){
    this.settingsService.settings = value;
    this.settingsService.save();
  }

  constructor(private settingsService: SettingsService, private _wpilibService: WPILibService) { }

  ngOnInit(): void {
  }

  save() {
    this.settingsService.save();
  }

  connect() {

  }
}
