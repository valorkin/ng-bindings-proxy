import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SolidBindingsSampleModule } from './solid-bindings/solid-bindings-sample';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SolidBindingsSampleModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
