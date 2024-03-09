import { INestApplicationContext } from '@nestjs/common';
import { SpelunkedTree } from './spelunker.interface';
export declare type ExplorationOpts = {
    ignoreImports: Array<RegExp | ((moduleName: string) => boolean)>;
};
export declare class ExplorationModule {
    static explore(app: INestApplicationContext, opts?: ExplorationOpts): SpelunkedTree[];
    private static getImports;
    private static getProviders;
    private static getControllers;
    private static getExports;
    private static getInjectionToken;
    private static tokenIsOptionalToken;
}
