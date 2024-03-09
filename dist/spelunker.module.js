"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagramModule = void 0;
const debug_module_1 = require("./debug.module");
const exploration_module_1 = require("./exploration.module");
const graphing_module_1 = require("./graphing.module");
class DiagramModule {
    static explore(app, opts) {
        return exploration_module_1.ExplorationModule.explore(app, opts);
    }
    static async debug(mod) {
        return debug_module_1.DebugModule.debug(mod);
    }
    static graph(tree) {
        return graphing_module_1.GraphingModule.graph(tree);
    }
    static findGraphEdges(root) {
        return graphing_module_1.GraphingModule.getEdges(root);
    }
}
exports.DiagramModule = DiagramModule;
//# sourceMappingURL=spelunker.module.js.map