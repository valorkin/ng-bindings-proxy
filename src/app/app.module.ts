import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent, LocalInputProviderComponent, PluginLauncherComponent, RemoteInputReceiver } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    PluginLauncherComponent,
    LocalInputProviderComponent,
    RemoteInputReceiver
  ],
  imports: [
    BrowserModule,
  ],
  schemas: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
