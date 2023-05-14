import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';
import { Scanner } from '../../../src/Internals/Scanner';
import { Parser } from '../../../src/Internals/Parser';
import { AstDebugPrinter } from '../../../src/Internals/Ast/AstDebugPrinter';

describe('SmolInteral AstDebugPrint', () => {
  test('Check all types print as expected', () => {

    const source = `
    function f(x) { return x ** 2; }
    var a = (10 + f(5)) * 2;
    debugger;
    class c {
        constructor() {
            this.x = 123;
        }

        getX() {
            return this.x;
        }
    }
    var i = new c();
    `;

    const ast = AstDebugPrinter.parse(source);

    console.log(ast);

  });
});