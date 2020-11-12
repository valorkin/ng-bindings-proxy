import { Component, NgModule } from '@angular/core';
import { ContentItemAppModule } from '../generated-mf-package/content-item-app.module';

@Component({
  template: `
    <fd-layout-panel [columnSpan]="1" fdLayoutGridSpan>
      <fd-layout-panel-body>
        <content-item-app [userId]="currentUserId" (loaded)="onLoaded()"></content-item-app>
      </fd-layout-panel-body>
    </fd-layout-panel>

  `
})
export class SomePageComponent {
  currentUserId = 'UUID4';

  onLoaded(): void {
    console.log('we are ready to display ');
  }
}

@NgModule({
  declarations: [SomePageComponent],
  imports: [ContentItemAppModule]
})
export class SomePageModule {
}
