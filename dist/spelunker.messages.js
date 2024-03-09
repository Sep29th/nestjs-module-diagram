"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCircularModule = exports.UndefinedProvider = exports.UndefinedClassObject = void 0;
const styler_1 = require("@ogma/styler");
const gitRepoUrl = 'https://github.com/jmcdo29/nestjs-spelunker';
const minWtf = 'https://minimum-reproduction.wtf';
const baseMessage = styler_1.style.whiteBg.black.apply("I'm not sure how you did it, but you got to a point in the code where you shouldn't have been able to reach.");
const newIssue = styler_1.style.bBlue.apply(`Please open a Bug Report here: ${gitRepoUrl}/issues/new.`);
const withMinRepro = styler_1.style.cyan.apply(`If possible, please provide a minimum reproduction as well: ${minWtf}`);
exports.UndefinedClassObject = `
${baseMessage}

Somehow, the ${styler_1.style.bold.apply('useClass')} and ${styler_1.style.bold.apply('useExisting')} options are both ${styler_1.style.red.bold.apply('undefined')} in a custom provider without a ${styler_1.style.bold.apply('useFactory')} or a ${styler_1.style.bold.apply('useValue')}.


${newIssue}

${withMinRepro}
`;
const UndefinedProvider = (provToken) => `
${baseMessage}

Somehow the token found for "${styler_1.style.yellow.apply(provToken)}" came back as ${styler_1.style.red.bold.apply('undefined')}. No idea how as this is all coming from Nest's internals in the first place.

${newIssue}

${withMinRepro}
`;
exports.UndefinedProvider = UndefinedProvider;
const InvalidCircularModule = (moduleName) => `The module "${styler_1.style.yellow.apply(moduleName)}" is trying to import an undefined module. Do you have an unmarked circular dependency?`;
exports.InvalidCircularModule = InvalidCircularModule;
//# sourceMappingURL=spelunker.messages.js.map