"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplorationModule = void 0;
const core_1 = require("@nestjs/core");
const internal_core_module_1 = require("@nestjs/core/injector/internal-core-module");
const spelunker_messages_1 = require("./spelunker.messages");
class ExplorationModule {
    static explore(app, opts) {
        const modulesArray = Array.from(app.container.getModules().values());
        const ignoreImportsPredicateFns = ((opts === null || opts === void 0 ? void 0 : opts.ignoreImports) || []).map((ignoreImportFnOrRegex) => ignoreImportFnOrRegex instanceof RegExp
            ? (moduleName) => ignoreImportFnOrRegex.test(moduleName)
            : ignoreImportFnOrRegex);
        const shouldIncludeModule = (module) => {
            const moduleName = module.metatype.name;
            return (module.metatype !== internal_core_module_1.InternalCoreModule &&
                !ignoreImportsPredicateFns.some((predicate) => predicate(moduleName)));
        };
        const dependencyMap = [];
        for (const nestjsModule of modulesArray) {
            if (shouldIncludeModule(nestjsModule)) {
                dependencyMap.push({
                    name: nestjsModule.metatype.name,
                    imports: this.getImports(nestjsModule),
                    providers: this.getProviders(nestjsModule),
                    controllers: this.getControllers(nestjsModule),
                    exports: this.getExports(nestjsModule),
                });
            }
        }
        return dependencyMap;
    }
    static getImports(module) {
        const importsNames = [];
        for (const importedModule of module.imports.values()) {
            if (importedModule.metatype.name !== internal_core_module_1.InternalCoreModule.name) {
                importsNames.push(importedModule.metatype.name);
            }
        }
        return importsNames;
    }
    static getProviders(module) {
        var _a;
        const providerList = {};
        for (const provider of module.providers.keys()) {
            if (provider === module.metatype ||
                provider === core_1.ModuleRef ||
                provider === core_1.ApplicationConfig) {
                continue;
            }
            const providerToken = this.getInjectionToken(provider);
            const providerInstanceWrapper = module.providers.get(provider);
            if (providerInstanceWrapper === undefined) {
                throw new Error((0, spelunker_messages_1.UndefinedProvider)(providerToken));
            }
            const metatype = providerInstanceWrapper.metatype;
            const name = (metatype && metatype.name) || 'useValue';
            let provided;
            switch (name) {
                case 'useValue':
                    provided = {
                        method: 'value',
                    };
                    break;
                case 'useClass':
                    provided = {
                        method: 'class',
                    };
                    break;
                case 'useFactory':
                    provided = {
                        method: 'factory',
                        injections: (_a = providerInstanceWrapper.inject) === null || _a === void 0 ? void 0 : _a.map((injection) => this.getInjectionToken(injection)),
                    };
                    break;
                default:
                    provided = {
                        method: 'standard',
                    };
            }
            providerList[providerToken] = provided;
        }
        return providerList;
    }
    static getControllers(module) {
        const controllersNames = [];
        for (const controller of module.controllers.values()) {
            controllersNames.push(controller.metatype.name);
        }
        return controllersNames;
    }
    static getExports(module) {
        const exportsNames = [];
        for (const exportValue of module.exports.values()) {
            exportsNames.push(this.getInjectionToken(exportValue));
        }
        return exportsNames;
    }
    static getInjectionToken(injection) {
        return typeof injection === 'function'
            ? injection.name
            : this.tokenIsOptionalToken(injection)
                ? injection.token.toString()
                : injection.toString();
    }
    static tokenIsOptionalToken(token) {
        return !!token['token'];
    }
}
exports.ExplorationModule = ExplorationModule;
//# sourceMappingURL=exploration.module.js.map