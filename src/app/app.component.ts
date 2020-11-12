import { NgComponentOutlet } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  ComponentFactoryResolver,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgModuleFactory,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  Type,
  ViewChild
} from '@angular/core';

// DONE:
// 0. this provides compile time check
// 1. Add run time checks for namings
// 3. Set initial values
// 4. extend ngOnChanges, not override
// 5. OnChange {PluginLauncher, RemoteComponent, LocalInput?}
// 6. Try NgComponentOutlet because it has ngOnChanges
// TODO:
// 2. TBD: how to check input types in runtime?

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
export class BindingsProviderAnchor implements OnInit {
  component: any;

  constructor(private elRef: ElementRef) {
  }

  ngOnInit(): void {
    this.component = this._getComponent(this.elRef.nativeElement);
  }

  _getComponent(nativeElement): any {

    const ngDevMode = true;
    const MONKEY_PATCH_KEY_NAME = '__ngContext__';
    const TVIEW = 1;
    const HEADER_OFFSET = 20;
    const HOST = 0;

    function findViaNativeElement(lView, target) {
      const tView = lView[TVIEW];
      for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
        if (unwrapRNode(lView[i]) === target) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Returns `RNode`.
     * @param value wrapped value of `RNode`, `LView`, `LContainer`
     */
    function unwrapRNode(value) {
      while (Array.isArray(value)) {
        value = value[HOST];
      }
      return value;
    }

    function readPatchedData(target) {
      return target[MONKEY_PATCH_KEY_NAME] || null;
    }

    function getLContext(target) {
      const mpValue = readPatchedData(target);
      if (mpValue) {
        // only when it's an array is it considered an LView instance
        // ... otherwise it's an already constructed LContext instance
        if (Array.isArray(mpValue)) {
          const lView = mpValue;
          let nodeIndex;
          nodeIndex = findViaNativeElement(lView, target);
          if (nodeIndex === -1) {
            return null;
          }
          return {nodeIndex, lView};
        }
      }
    }

    function getComponentAtNodeIndex(nodeIndex, lView) {
      const tNode = lView[TVIEW].data[nodeIndex];
      let directiveStartIndex = tNode.directiveStart;
      return tNode.flags & 2 /* isComponentHost */ ? lView[directiveStartIndex] : null;
    }

    function loadLContext(target, throwOnNotFound = true) {
      const context = getLContext(target);
      return context;
    }

    function getComponent(element) {
      const context = loadLContext(element, false) as any;
      if (context === null) {
        return null;
      }
      if (context.component === undefined) {
        context.component = getComponentAtNodeIndex(context.nodeIndex, context.lView);
      }
      return context.component;
    }

    return getComponent(nativeElement);
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
    <ng-container *ngComponentOutlet="component; ngModuleFactory: module"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginLauncherComponent implements OnInit, AfterViewChecked {
  @ViewChild(NgComponentOutlet) ngContentView: NgComponentOutlet;

  @ContentChild(BindingsProviderAnchor) bindingAnchor: any;

  local: any;
  remote: any;

  component: Type<any>;
  module: NgModuleFactory<any>;

  private isInitialized = false;

  constructor(
    private readonly _cd: ChangeDetectorRef,
    private readonly cfr: ComponentFactoryResolver,
    private readonly _injector: Injector,
    private readonly compiler: Compiler) {
  }

  /**
   * Inject remote component and link local bindings to remote component
   */
  ngOnInit(): void {
    this.injectRemoteComponent();
  }

  ngAfterViewChecked(): void {
    if (!this.isInitialized && (this.ngContentView as any)?._componentRef) {
      this.isInitialized = true;
      this.nokia();
    }
  }

  async injectRemoteComponent(): Promise<void> {
    const module = await import('./remote/remote.module');
    this.module = await this.compiler.compileModuleAsync(module.RemoteModule);
    this.component = module.RemoteInputReceiver;
    this._cd.detectChanges();
  }

  /** Link local bindings to remote component */
  nokia(): void {
    this.remote = (this.ngContentView as any)._componentRef.instance;
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
        this._cd.detectChanges();
      });

      const originalOnChanges = this.local.ngOnChanges.bind(this.local);
      this.local.ngOnChanges = (value: SimpleChanges): void => {
        originalOnChanges(value);
        if (value) {
          for (const key of Object.keys(value)) {
            this.remote[key] = value[key].currentValue;
          }
          this._cd.detectChanges();
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






