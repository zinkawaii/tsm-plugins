import { createFilter } from "rollup-utils";
import { createPlugin } from "ts-macro";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Mapping } from "@volar/source-map";
import type ts from "typescript";

export interface Options {
    include?: FilterPattern;
    exclude?: FilterPattern;
}

export default createPlugin<Options | undefined>(({ ts }, options) => {
    const {
        include = /\.d\.ts$/,
        exclude
    } = options ?? {};

    const filter = createFilter(
        include,
        exclude,
        { resolve: ts.sys.getCurrentDirectory() }
    );

    return {
        name: "goto-definition",
        resolveVirtualCode(virtualCode) {
            if (!filter(virtualCode.filePath)) {
                return;
            }

            (virtualCode as any).linkedCodeMappings ??= [];
            const { ast } = virtualCode;
            visit(ast);

            function visit(node: ts.Node) {
                ts.forEachChild(node, visit);

                if (ts.isInterfaceDeclaration(node)) {
                    for (const member of node.members) {
                        if (ts.isPropertySignature(member)) {
                            const { name, type } = member;
                            if (type) {
                                link(name, type);
                            }
                        }
                    }
                }
                else if (ts.isModuleDeclaration(node)) {
                    node.body && ts.forEachChild(node.body, (stmt) => {
                        if (ts.isVariableStatement(stmt)) {
                            for (const { name, type } of stmt.declarationList.declarations) {
                                if (ts.isIdentifier(name) && type) {
                                    link(name, type);
                                }
                            }
                        }
                    });
                }
            }

            function link(name: ts.PropertyName, type: ts.TypeNode) {
                if (!ts.isIndexedAccessTypeNode(type)) {
                    return;
                }

                ((virtualCode as any).linkedCodeMappings as Mapping[]).push({
                    sourceOffsets: [
                        name.getStart(ast),
                        name.getEnd()
                    ],
                    generatedOffsets: [
                        type.indexType.getStart(ast),
                        type.indexType.getEnd()
                    ],
                    lengths: [0, 0],
                    data: void 0
                });
            }
        }
    };
});