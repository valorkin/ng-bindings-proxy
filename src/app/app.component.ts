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
  @Output() out_prop_1 = new EventEmitter<string>();
  @Output() out_prop_2 = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
  }
}

@Component({
  selector: `remote-input-receiver`,
  template: `
    <p>prop 1: {{input_prop_1}}</p>
    <p><input type="text" (change)="out_prop_1.emit($event.target.value)"></p>
  `
})
export class RemoteInputReceiver {
  @Input() input_prop_1: string;
  @Output() out_prop_1 = new EventEmitter<string>();
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
      <local-input-provider #test [input_prop_1]="t1" (out_prop_1)="updateT2($event)"></local-input-provider>
      <remote-input-receiver></remote-input-receiver>
    </p>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild(LocalInputProviderComponent) local: any;
  @ViewChild(RemoteInputReceiver) remote: any;
  t1 = 'zero input';
  t2 = 'zero no input';

  updateT2(value: any): void {
    this.t2 = value;
  }

  ngAfterViewInit(): void {
    console.log(this.local);
    console.log(this.remote);

    // 0. this provides compile time check
    // 1. Add run time checks for namings
    // 2. TBD: how to check input types in runtime?
    // done - 3. Set initial values
    const inputs = this.local.constructor.ɵcmp.inputs;
    if (inputs) {
      const inputArr = Object.keys(inputs);
      // set initial values
      setTimeout(() => {
        for (const key of inputArr) {
          this.remote[key] = this.local[key];
        }
      });

      this.local.ngOnChanges = (value: SimpleChanges): void => {
        if (value) {
          for (const key of Object.keys(value)) {
            this.remote[key] = value[key].currentValue;
          }
        }
      };
    }

    const outputs = this.local.constructor.ɵcmp.outputs;
    if (outputs) {
      const outputArr = Object.keys(outputs);
      for (const key of outputArr) {
        this.remote[key].subscribe((value: any) => this.local[key]?.emit(value));
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






