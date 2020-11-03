import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';

/** This is component loaded via module federation
 * we don't know at compile time it's interface
 */
@Component({
  selector: 'remote-input-receiver',
  template: `
    <p>prop 1: {{input_prop_1}}</p>
    <p><input type="text" (change)="out_prop_1.emit($event.target.value)"></p>
  `
})
export class RemoteInputReceiver {
  @Input() input_prop_1: string;
  @Output() out_prop_1 = new EventEmitter<string>();
}

@NgModule({
  declarations: [RemoteInputReceiver],
  exports: [RemoteInputReceiver]
})
export class RemoteModule {
}
