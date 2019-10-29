// import { enableProdMode } from '@angular/core';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// import { AppModule } from './app/app.module';
// import { environment } from './environments/environment';

// if (environment.production) {
//   enableProdMode();
// }

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { MatInkBar } from '@angular/material/tabs';
import { Assets } from './libs/3d-cube/Assets';

if (environment.production) {
  enableProdMode();
}

async function main() {
  (window as any).assets = await Assets.LoadAllAssets()
  platformBrowserDynamic().bootstrapModule(AppModule)
}

main().catch(err => console.error(err));

localStorage.debug = 'sk-ble:*'
// localStorage.debug = 'sk-ble:cubeState';

