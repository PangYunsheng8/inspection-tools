import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CubeComponent } from './components/cube/cube.component';
import { ConnectionComponent } from './components/connection/connection.component';
import { CubeInformationComponent } from './components/cube-information/cube-information.component';
import { InspectionBaseComponent } from './components/inspection-base/inspection-base.component';
import { StaticInspectionComponent } from './components/static-inspection/static-inspection.component';
import { DynamicInspectionComponent } from './components/dynamic-inspection/dynamic-inspection.component';
import { SideAxisInspectionComponent } from './components/side-axis-inspection/side-axis-inspection.component';
import { InspectionResultComponent } from './components/inspection-result/inspection-result.component';
import { MaterialModule } from './material.module';
import { ElModule } from 'element-angular';
import { IonicModule } from '@ionic/angular';    

import { BleService } from './services/ble.service';
import { BleStateService } from './services/ble-state.service';
import { BleBrowserService } from './services/ble-browser.service';
import { BleNativeService } from './services/ble-native.service';
import { BleConfigService } from './services/ble-config.service';
import { BleCommandService } from './services/ble-command.service';
import { CubeRotateService } from './services/cube-rotate.service';
// import { SkInfoService } from './services/sk-info.service';
import { AttitudeService } from './services/attitude.service';
import { BleValidService } from './services/ble-valid.service'
import { BleInspectionService } from './services/ble-inspection.service';
import { BLE } from '@ionic-native/ble/ngx';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { Device } from '@ionic-native/device/ngx';

@NgModule({
  declarations: [
    AppComponent,
    ConnectionComponent,
    CubeComponent,
    CubeInformationComponent,
    InspectionBaseComponent,
    StaticInspectionComponent,
    DynamicInspectionComponent,
    SideAxisInspectionComponent,
    InspectionResultComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ElModule.forRoot(),
    IonicModule.forRoot()
  ],
  providers: [
    BleService,
    BleStateService,
    BleBrowserService,
    BleNativeService,
    BLE,
    BluetoothLE,
    Device,
    BleConfigService,
    BleInspectionService,
    BleValidService,
    BleCommandService,
    CubeRotateService,
    AttitudeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
