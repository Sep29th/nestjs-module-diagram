"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphingModule = void 0;
class GraphingModule {
    static graph(tree) {
        const nodeMap = tree.reduce((map, module) => map.set(module.name, {
            dependencies: new Set(),
            dependents: new Set(),
            module,
        }), new Map());
        for (const [, node] of nodeMap) {
            this.findDependencies(node, nodeMap);
        }
        return this.findRoot(nodeMap);
    }
    static getEdges(root) {
        return [...this.getEdgesRecursively(root).values()];
    }
    static findDependencies(node, nodeMap) {
        return node.module.imports.map((m) => {
            const dependency = nodeMap.get(m);
            if (!dependency)
                throw new Error(`Unable to find ${m}!`);
            node.dependencies.add(dependency);
            dependency.dependents.add(node);
            return dependency;
        });
    }
    static findRoot(nodeMap) {
        var _a;
        const nodes = [...nodeMap.values()];
        const root = (_a = nodes.find((n) => n.dependents.size === 0)) !== null && _a !== void 0 ? _a : nodes[0];
        if (!root)
            throw new Error('Unable to find root node');
        return root;
    }
    static getEdgesRecursively(root, visitedNodes = new Set()) {
        const set = new Set();
        if (visitedNodes.has(root))
            return set;
        visitedNodes.add(root);
        for (const node of root.dependencies) {
            set.add({ from: root, to: node });
            const edges = this.getEdgesRecursively(node, visitedNodes);
            for (const edge of edges) {
                set.add(edge);
            }
        }
        return set;
    }
}
exports.GraphingModule = GraphingModule;
//# sourceMappingURL=graphing.module.js.map