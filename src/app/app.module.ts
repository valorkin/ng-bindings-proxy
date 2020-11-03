import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent, BindingsProviderAnchor, LocalInputProviderComponent, PluginLauncherComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    PluginLauncherComponent,
    LocalInputProviderComponent,
    BindingsProviderAnchor
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
