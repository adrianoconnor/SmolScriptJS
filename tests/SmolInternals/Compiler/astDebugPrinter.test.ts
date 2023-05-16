import { describe, expect, test } from '@jest/globals';
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

    expect(ast).toBe(`[function name=f]
  param 0: x
  [block]
    [return expr:(** (var x) (literal (SmolNumber) 2))]
  [/block]
[/functionExpression]
[declare var a initializer:(* (group expr:(+ (literal (SmolNumber) 10) (call (var f) with 1 args))) (literal (SmolNumber) 2))]
[debugger]
[class name=Token: IDENTIFIER, c, c]
  [classFunction name=constructor]
    [block]
      [exprStmt (set obj:(var this) name:x value:(literal (SmolNumber) 123))]
    [/block]
  [/classFunction]
  [classFunction name=getX]
    [block]
      [return expr:(get obj:(var this) name:x)]
    [/block]
  [/classFunction]
[/class]
[declare var i initializer:(new c with 0 args in ctor)]
`);

  });
});