import { SpelunkedEdge, SpelunkedNode, SpelunkedTree } from './spelunker.interface';
export declare class GraphingModule {
    static graph(tree: SpelunkedTree[]): SpelunkedNode;
    static getEdges(root: SpelunkedNode): SpelunkedEdge[];
    private static findDependencies;
    private static findRoot;
    private static getEdgesRecursively;
}
