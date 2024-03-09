import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { DebuggedTree } from './spelunker.interface';
export declare class DebugModule {
    private static seenModules;
    static debug(modRef?: Type<any> | DynamicModule | ForwardReference, importingModule?: string): Promise<DebuggedTree[]>;
    private static moduleIsForwardReference;
    private static getStandardModuleMetadata;
    private static getDynamicModuleMetadata;
    private static getImportName;
    private static resolveImport;
    private static getImports;
    private static getController;
    private static getProviders;
    private static getExports;
    private static getDependencies;
    private static getProviderName;
    private static isCustomProvider;
    private static exportType;
}
