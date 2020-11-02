import {
  AfterViewChecked,
  Component,
  Input,
  NgModule,
  Output,
  ViewChild,
  EventEmitter,
  AfterViewInit,
  SimpleChanges,
  OnChanges, Injectable
} from '@angular/core';

@Component({selector: 'local-input-provider', template: ``})
export class LocalInputProviderComponent implements OnChanges {
  @Input() input_prop_1: string;
  @Input() input_prop_2: number;
  @Output() outout_prop_1 = new EventEmitter<string>();
  @Output() outout_prop_2 = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
  }
}

@Component({
  selector: `remote-input-receiver`,
  template: `
    <p>prop 1: {{input_prop_1}}</p>
    <p><input type="text" (change)="outout_prop_1.emit($event.target.value)"></p>
  `
})
export class RemoteInputReceiver {
  @Input() input_prop_1: string;
  @Output() outout_prop_1 = new EventEmitter<string>();
}

@Component({
  selector: 'app-root',
  template: `
    local to remote inputs binding
    <p>
      <input type="text" (change)="t1 = $event.target.value " [value]="t1">
      <input type="text" (change)="t2 = $event.target.value " [value]="t2">
    </p>
    <p>
      <local-input-provider #test></local-input-provider>
      <remote-input-receiver></remote-input-receiver>
    </p>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild(LocalInputProviderComponent) local: any;
  @ViewChild(RemoteInputReceiver) remote: any;
  t1 = 'zero input';
  t2 = 'zero no input';

  ngAfterViewInit(): void {
    console.log(this.local);
    console.log(this.remote);

    // 0. this provides compile time check
    // 1. Add run time checks for namings
    // 2. TBD: how to check input types in runtime?
    const inputs = this.local.constructor.ɵcmp.inputs;
    if (inputs) {
      const inputArr = Object.keys(inputs);
      this.local.ngOnChanges = (value: SimpleChanges): void => {
        if (value) {
          console.log(value);
        }
      };
    }

    const outputs = this.local.constructor.ɵcmp.outputs;
    if (outputs) {
      const outputArr = Object.keys(outputs);
      for (const key of outputArr) {
        this.remote.ɵcmp.outputs[key].subscribe((value: any) => this.local.ɵcmp)
      }
    }

  }

  /*    ngAfterViewInit(): void {
        console.log(this.element);
        this.element.constructor.ɵcmp.features = this.element.constructor.ɵcmp.features || [];
        this.element.constructor.ɵcmp.features.push(ɵɵNgOnChangesFeature);
        this.element.ngOnChanges = (v: any): void => {
          console.log(`parent`);
          console.log(v);
        };

        this.element.ouput_prop.subscribe(v => console.log(`output ${v}`));
        // ɵcmp.features.push(ɵɵNgOnChangesFeature) if none
      }*/
}






