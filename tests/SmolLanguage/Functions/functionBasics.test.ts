import { describe, expect, test } from '@jest/globals';
import { AstDebugPrinter } from '../../../src/Internals/Ast/AstDebugPrinter';
import { Compiler } from '../../../src/Internals/Compiler';

describe('Function Basics', () => {
  test('Declare and Call Simple Function', () => {
    let source = `
    function test(a) {
        return a + 10;
    }
    
    var b = test(5);
    `;

    var c = new Compiler();

    var prog = c.Compile(source);

    console.log(prog);
    
  }),
  
  test('Declare and Call Simple Function - Generate AST', () => {
    let source = `
    function test(a) {
        return a + 10;
    }
    
    var b = test(5);
    `;

    var ast = AstDebugPrinter.parse(source);

    expect(ast).toBe(`[function name=test]
  param 0: a
  [block]
    [return expr:(+ (var a) (literal (SmolNumber) 10))]
  [/block]
[/functionExpression]
[declare var b initializer:(call (var test) with 1 args)]
`);
    
  });
});