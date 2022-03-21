// roboRIO-2421-FRC.local
// https://github.com/rakusan2/FRC-NT-Client#readme
import { Client as NTClient} from 'wpilib-nt-client';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class wpilibService {
  public client: NTClient = new NTClient();
  public teamUrl = 'roboRIO-2421-FRC.local';

  constructor() {}

  start() {
    // Connects the client to the server on team 3571's roborio
    this.client.start((isConnected, err) => {
      // Displays the error and the state of connection
      console.log({ isConnected, err });
    }, this.teamUrl);
  }

  listen() {
    // Adds a listener to the client
    this.client.addListener((key, val, type, id) => {
      console.log({ key, val, type, id });
    });
  }

  stop() { this.client.stop(); }


}