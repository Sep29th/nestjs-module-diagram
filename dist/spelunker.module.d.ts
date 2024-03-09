import { INestApplicationContext, Type } from '@nestjs/common';
import { ExplorationOpts } from './exploration.module';
import { DebuggedTree, SpelunkedEdge, SpelunkedNode, SpelunkedTree } from './spelunker.interface';
export declare class DiagramModule {
    static explore(app: INestApplicationContext, opts?: ExplorationOpts): SpelunkedTree[];
    static debug(mod: Type<any>): Promise<DebuggedTree[]>;
    static graph(tree: SpelunkedTree[]): SpelunkedNode;
    static findGraphEdges(root: SpelunkedNode): SpelunkedEdge[];
}
