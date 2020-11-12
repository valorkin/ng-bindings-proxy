import { Inject, Injectable, InjectionToken } from '@angular/core';
import { LookupItem, PluginDescriptor } from '@fundamental-ngx/app-shell';

export const MF_PLUGIN_CONFIG = new InjectionToken('Use this token to provide MF plugin ');

// change
@Injectable({ providedIn: 'root' })
export class LookupService  {
  constructor(@Inject(MF_PLUGIN_CONFIG) private pluginsRepository: PluginDescriptor[]) {
  }

  lookup(query: Map<string, string>, isRoute: boolean = false): LookupItem {
    const predicate = (record: Record<string, any>): boolean => {
      let match = true;
      query.forEach((value, key) => {
        match = match && record[key] === value;
      });
      return match;
    };
    const plugin = this.pluginsRepository.find((_plugin) => {
      return predicate(_plugin) || _plugin.modules.some(predicate);
    });
    let module;
    if (isRoute) {
      module = plugin.modules.find(predicate);
    }
    if (!plugin || (!module && isRoute)) {
      throw new Error('No Plugin found. Please check your configuration.');
    }
    const item: LookupItem = {
      id: plugin.name,
      attributes: query,
      version: plugin.version,
      descriptor: plugin,
      module
    };

    // take the first one.
    return item;
  }
}

// we can remove
class PluginManagerService {}

function loadConfiguration(): void {}

/*(http: HttpClient, plugins: PluginManagerService, url: string): () => Promise<boolean|void> {
  if (!url) {
    // todo_valorkin throw new Error('Plugins configuration error, `url` is a mandatory parameter')
    return () => Promise.resolve(true);
  }

  return () => http.get<Array<Partial<PluginDescriptor>>>(url).toPromise()
    .then(conf => plugins.loadConfiguration(conf));
}*/
