"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugModule = void 0;
const constants_1 = require("@nestjs/common/constants");
const spelunker_messages_1 = require("./spelunker.messages");
function isObject(val) {
    const isNil = val == null;
    return !isNil && typeof val === 'object';
}
function hasProp(val, property) {
    return isObject(val) && Object.prototype.hasOwnProperty.call(val, property);
}
class DebugModule {
    static async debug(modRef, importingModule) {
        const debuggedTree = [];
        if (modRef === undefined) {
            process.stdout.write(`The module "${importingModule}" is trying to import an undefined module. Do you have an unmarked circular dependency?\n`);
            return [];
        }
        if (typeof modRef === 'function') {
            debuggedTree.push(...(await this.getStandardModuleMetadata(modRef)));
        }
        else if (this.moduleIsForwardReference(modRef)) {
            const circMod = modRef.forwardRef();
            if (!this.seenModules.includes(circMod)) {
                this.seenModules.push(circMod);
                debuggedTree.push(...(await this.getStandardModuleMetadata(circMod)));
            }
        }
        else {
            debuggedTree.push(...(await this.getDynamicModuleMetadata(modRef)));
        }
        return debuggedTree.filter((item, index) => {
            const itemString = JSON.stringify(item);
            return (index ===
                debuggedTree.findIndex((subItem) => itemString === JSON.stringify(subItem)));
        });
    }
    static moduleIsForwardReference(modRef) {
        return Object.keys(modRef).includes('forwardRef');
    }
    static async getStandardModuleMetadata(modRef) {
        const imports = [];
        const providers = [];
        const controllers = [];
        const exports = [];
        const subModules = [];
        for (const key of Reflect.getMetadataKeys(modRef)) {
            switch (key) {
                case constants_1.MODULE_METADATA.IMPORTS: {
                    const baseImports = this.getImports(modRef);
                    for (const imp of baseImports) {
                        subModules.push(...(await this.debug(imp, modRef.name)));
                    }
                    imports.push(...(await Promise.all(baseImports.map(async (imp) => this.getImportName(imp)))));
                    break;
                }
                case constants_1.MODULE_METADATA.PROVIDERS: {
                    const baseProviders = Reflect.getMetadata(constants_1.MODULE_METADATA.PROVIDERS, modRef) || [];
                    providers.push(...this.getProviders(baseProviders));
                    break;
                }
                case constants_1.MODULE_METADATA.CONTROLLERS: {
                    const baseControllers = this.getController(modRef);
                    const debuggedControllers = [];
                    for (const controller of baseControllers) {
                        debuggedControllers.push({
                            name: controller.name,
                            dependencies: this.getDependencies(controller),
                        });
                    }
                    controllers.push(...debuggedControllers);
                    break;
                }
                case constants_1.MODULE_METADATA.EXPORTS: {
                    const baseExports = this.getExports(modRef);
                    exports.push(...baseExports.map((exp) => ({
                        name: exp.name,
                        type: this.exportType(exp),
                    })));
                    break;
                }
            }
        }
        return [
            {
                name: modRef.name,
                imports,
                providers,
                controllers,
                exports,
            },
        ].concat(subModules);
    }
    static async getDynamicModuleMetadata(incomingModule) {
        var _a, _b;
        const imports = [];
        const providers = [];
        const controllers = [];
        const exports = [];
        const subModules = [];
        let modRef;
        if (incomingModule.then) {
            modRef = await incomingModule;
        }
        else {
            modRef = incomingModule;
        }
        for (let imp of (_a = modRef.imports) !== null && _a !== void 0 ? _a : []) {
            if (typeof imp === 'object') {
                imp = await this.resolveImport(imp);
            }
            subModules.push(...(await this.debug(imp)));
            imports.push(await this.getImportName(imp));
        }
        providers.push(...this.getProviders(modRef.providers || []));
        const debuggedControllers = [];
        for (const controller of modRef.controllers || []) {
            debuggedControllers.push({
                name: controller.name,
                dependencies: this.getDependencies(controller),
            });
        }
        controllers.push(...debuggedControllers);
        exports.push(...((_b = modRef.exports) !== null && _b !== void 0 ? _b : []).map((exp) => ({
            name: typeof exp === 'function'
                ? exp.name
                :
                    typeof exp === 'object'
                        ?
                            exp.provide.name ||
                                exp.provide.toString()
                        : exp.toString(),
            type: this.exportType(exp),
        })));
        return [
            {
                name: modRef.module.name,
                imports,
                providers,
                controllers,
                exports,
            },
        ].concat(subModules);
    }
    static async getImportName(imp) {
        if (imp === undefined) {
            return '*********';
        }
        let name = '';
        const resolvedImp = await this.resolveImport(imp);
        if (typeof resolvedImp === 'function') {
            name = resolvedImp.name;
        }
        else {
            name = resolvedImp.module.name;
        }
        return name;
    }
    static async resolveImport(imp) {
        return imp.then
            ? await imp
            : imp.forwardRef
                ? imp.forwardRef()
                : imp;
    }
    static getImports(modRef) {
        return Reflect.getMetadata(constants_1.MODULE_METADATA.IMPORTS, modRef);
    }
    static getController(modRef) {
        return Reflect.getMetadata(constants_1.MODULE_METADATA.CONTROLLERS, modRef);
    }
    static getProviders(providers) {
        const debuggedProviders = [];
        for (const provider of providers) {
            let dependencies;
            if (!this.isCustomProvider(provider)) {
                debuggedProviders.push({
                    name: provider.name,
                    dependencies: this.getDependencies(provider),
                    type: 'class',
                });
            }
            else {
                const newProvider = {
                    name: this.getProviderName(provider.provide),
                    dependencies: [],
                    type: 'class',
                };
                if (hasProp(provider, 'useValue')) {
                    newProvider.type = 'value';
                    dependencies = () => [];
                }
                else if (hasProp(provider, 'useFactory')) {
                    newProvider.type = 'factory';
                    dependencies = () => { var _a; return ((_a = provider.inject) !== null && _a !== void 0 ? _a : []).map(this.getProviderName); };
                }
                else if (hasProp(provider, 'useClass')) {
                    newProvider.type = 'class';
                    dependencies = () => this.getDependencies(provider.useClass);
                }
                else if (hasProp(provider, 'useExisting')) {
                    newProvider.type = 'class';
                    dependencies = () => this.getDependencies(provider.useExisting);
                }
                else {
                    throw new Error('Unknown provider type');
                }
                newProvider.dependencies = dependencies();
                debuggedProviders.push(newProvider);
            }
        }
        return debuggedProviders;
    }
    static getExports(modRef) {
        return Reflect.getMetadata(constants_1.MODULE_METADATA.EXPORTS, modRef);
    }
    static getDependencies(classObj) {
        var _a;
        if (!classObj) {
            throw new Error(spelunker_messages_1.UndefinedClassObject);
        }
        const retDeps = [];
        const typedDeps = Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, classObj) || [];
        for (const dep of typedDeps) {
            retDeps.push((_a = dep === null || dep === void 0 ? void 0 : dep.name) !== null && _a !== void 0 ? _a : 'UNKNOWN');
        }
        const selfDeps = Reflect.getMetadata(constants_1.SELF_DECLARED_DEPS_METADATA, classObj) || [];
        for (const selfDep of selfDeps) {
            let dep = selfDep.param;
            if (typeof dep === 'object') {
                dep = dep.forwardRef().name;
            }
            retDeps[selfDep.index] = dep;
        }
        if (retDeps.includes('UNKNOWN')) {
            process.stdout.write(`The provider "${classObj.name}" is trying to inject an undefined dependency. Do you have '@Inject(forwardRef())' in use here?\n`);
        }
        return retDeps;
    }
    static getProviderName(provider) {
        return typeof provider === 'function' ? provider.name : provider.toString();
    }
    static isCustomProvider(provider) {
        return provider.provide;
    }
    static exportType(classObj) {
        let isModule = false;
        if (typeof classObj !== 'function') {
            return 'provider';
        }
        for (const key of Object.keys(constants_1.MODULE_METADATA)) {
            if (Reflect.getMetadata(constants_1.MODULE_METADATA[key], classObj)) {
                isModule = true;
            }
        }
        return isModule ? 'module' : 'provider';
    }
}
exports.DebugModule = DebugModule;
DebugModule.seenModules = [];
//# sourceMappingURL=debug.module.js.map