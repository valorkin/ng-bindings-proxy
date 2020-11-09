import { Component, EventEmitter, Input, NgModule, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AppShellModule } from '@fundamental-ngx/app-shell';
import { MF_PLUGIN_JSON_PROVIDE } from '../fundamentals-appshell/extend-fundamental';
import * as plugin from './plugin.json';

@Component({
  selector: 'content-item-app',
  template: `
    <fds-plugin-launcher name="contentItemApp" module="YourFavoritesComponent"></fds-plugin-launcher>
  `
})
export class ContentItemAppComponent implements OnChanges {
  @Input() userId: string;
  @Output() loaded = new EventEmitter<string>();
  ngOnChanges(changes: SimpleChanges): void {
  }
}

@NgModule({
  declarations: [ContentItemAppComponent],
  imports: [AppShellModule],
  exports: [ContentItemAppComponent],
  providers: [{provide: MF_PLUGIN_JSON_PROVIDE, useValue: plugin, multi: true}]
})
export class ContentItemAppModule {}
