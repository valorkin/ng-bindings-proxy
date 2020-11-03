import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver, ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {} from '@angular/core/src/r3_symbols';

// 0. this provides compile time check
// 1. Add run time checks for namings
// 2. TBD: how to check input types in runtime?
// done - 3. Set initial values
// 4. extend ngOnChanges, not override
// 5. FIX: OnChange {PluginLaunhcer, RemoteComponent, LocalInput?}
// 6. Try NgComponentOutlet because it has ngOnChanges

/** This is component is written by Application developers
 * in order to have inputs\outputs
 * and compile time checks for a low price
 * TBD would be great if Angular compiler\angular language service would support Deno like imports
 */
@Component({selector: 'local-input-provider', template: ``})
export class LocalInputProviderComponent implements OnChanges {
  @Input() input_prop_1: string;
  @Input() input_prop_2: number;
  @Output() out_prop_1 = new EventEmitter<string>();
  @Output() out_prop_2 = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`original on changes`);
  }
}

@Directive({selector: '[localBindingsAnchor]'})
export class BindingsProviderAnchor {
  component: any;

  constructor(private el: ElementRef) {
    this.component = (window as any).ng.getComponent(el.nativeElement);
  }
}

/**
 * This is plugin launcher which injects remote component from remote entry
 * Plus it's linking local API provider to remote component
 */
@Component({
  selector: 'test-plugin-launcher',
  template: `
    <p>test-plugin-launcher</p>
    <ng-container #view></ng-container>
  `,
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginLauncherComponent implements AfterContentInit {
  @ViewChild('view', {read: ViewContainerRef, static: true})
  ngContentView: ViewContainerRef;

  @ContentChild(BindingsProviderAnchor) bindingAnchor: any;

  local: any;
  remote: any;

  constructor(
    private readonly _cd: ChangeDetectorRef,
    private readonly cfr: ComponentFactoryResolver,
    private readonly _injector: Injector) {
  }

  /**
   * Inject remote component and link local bindings to remote component
   */
  ngAfterContentInit(): void {
    this.render();
  }

  async render(): Promise<void> {
    await this.injectRemoteComponent();
    // because nokia is connecting people :D
    this.nokia();
    // this._cd.detectChanges();
  }

  async injectRemoteComponent(): Promise<void> {
    // todo: lazy load component
    const module = await import('./remote/remote.module');
    const _component = module.RemoteInputReceiver;
    // if (_module.type === 'angular-ivy-component' && this.ngContentView) {
    this.ngContentView.clear();
    const factory = this.cfr.resolveComponentFactory(_component);
    const ref = this.ngContentView.createComponent(factory, null, this._injector);
    this._cd.detectChanges();
    // }

    this.remote = ref.instance;
  }

  /** Link local bindings to remote component */
  nokia(): void {
    this.local = this.bindingAnchor.component;
    const inputs = this.local.constructor.ɵcmp.inputs;
    const remoteInputs = this.remote.constructor.ɵcmp.inputs;

    if (inputs) {
      const inputArr = Object.keys(inputs);
      // validate and report local extra inputs
      for (const key of inputArr) {
        if (!(key in remoteInputs)) {
          console.warn(`Remote component "${this.remote.constructor.name}" doesn't have "${key}" @Input() property,
          while "${this.local.constructor.name}" does`);
        }
      }
      // set initial values
      setTimeout(() => {
        for (const key of inputArr) {
          this.remote[key] = this.local[key];
        }
      });

      const originalOnChanges = this.local.ngOnChanges.bind(this.local);
      this.local.ngOnChanges = (value: SimpleChanges): void => {
        originalOnChanges(value);
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
        if (this.remote[key]?.subscribe) {
          this.remote[key].subscribe((value: any) => this.local[key]?.emit(value));
        } else {
          console.warn(`Remote component "${this.remote.constructor.name}" doesn't have "${key}" @Output() property,
          while "${this.local.constructor.name}" does`);
        }
      }
    }
  }
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
      <test-plugin-launcher>
        <local-input-provider localBindingsAnchor
                              [input_prop_1]="t1" (out_prop_1)="updateT2($event)"></local-input-provider>
      </test-plugin-launcher>
    </p>
  `
})
export class AppComponent {
  t1 = 'zero input';
  t2 = 'zero no input';

  updateT2(value: any): void {
    this.t2 = value;
  }
}






