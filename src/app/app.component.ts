import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  
  constructor(
    private menu: MenuController,
  ) {}

  ngOnInit() {  
  }

  public openDeviceDetails() {
    this.menu.enable(true, 'device-details');
    this.menu.open('device-details');
  }

  public openSettings() {
    this.menu.enable(true, 'settings');
    this.menu.open('settings');
  }
}
