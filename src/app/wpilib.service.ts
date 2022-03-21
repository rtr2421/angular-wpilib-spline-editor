// roboRIO-2421-FRC.local
// https://github.com/rakusan2/FRC-NT-Client#readme
// import { Client as NTClient} from 'wpilib-nt-client';

import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { SettingsService } from './settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class wpilibService {
  // public client: NTClient = new NTClient();
  // public teamUrl = this.settingsService.settings.teamDomain;
  config: SocketIoConfig = {
    url: '',
    options: {},
  };
  socket?: Socket;
  port = 1735;

  constructor(private settingsService: SettingsService) {
    // this.socket = new Socket(this.config);
  }

  start() {
    if(this.socket) {
      this.socket.disconnect();
    }
    this.config.url = `tcp://${this.settingsService.settings.teamDomain}:${this.port}`;
    this.socket = new Socket(this.config);
  }

  listen() {
  }

  stop() { this.socket?.disconnect(); }


}