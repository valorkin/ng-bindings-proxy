import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent, LocalInputProviderComponent, RemoteInputReceiver } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
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
