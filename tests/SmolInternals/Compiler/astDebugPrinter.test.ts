import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';
import { Scanner } from '../../../src/Internals/Scanner';
import { Parser } from '../../../src/Internals/Parser';
import { AstDebugPrinter } from '../../../src/Internals/Ast/AstDebugPrinter';

describe('SmolInteral AstDebugPrint', () => {
  test('Check all types print as expected', () => {

    const source = `
    var a = (10 + 5) * 2;
    debugger;
    `;

    const ast = AstDebugPrinter.parse(source);

    //console.log(ast);

  });
});