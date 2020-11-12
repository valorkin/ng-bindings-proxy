/*
* THIS IS GENERATED CODE, DO NOT MODIFY
*/
import { Component, EventEmitter, Input, NgModule, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AppShellModule } from '@fundamental-ngx/app-shell';
import { MF_PLUGIN_CONFIG } from '../fundamentals-appshell/extend-fundamental';
import * as plugin from './plugin.json';

@Component({
  selector: 'content-item-app',
  template: `
    <fds-plugin-launcher name="generatedMfPackage"
                         module="ContentItemAppModule"
                         component="ContentItemAppComponent"
                         [bindings]="bindings"></fds-plugin-launcher>
  `
})
export class ContentItemAppComponent implements OnChanges {
  @Input() userId: string;
  @Output() loaded = new EventEmitter<string>();

  bindings = this;

  ngOnChanges(changes: SimpleChanges): void {
  }
}

@NgModule({
  declarations: [ContentItemAppComponent],
  imports: [AppShellModule],
  exports: [ContentItemAppComponent],
  providers: [{provide: MF_PLUGIN_CONFIG, useValue: plugin, multi: true}]
})
export class ContentItemAppModule {}
