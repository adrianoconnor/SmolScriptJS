import { describe, expect, test } from '@jest/globals';
import { AstDebugPrinter } from '../../../src/Internals/Ast/AstDebugPrinter';
import { Compiler } from '../../../src/Internals/Compiler';
import { SmolVM } from '../../../src/SmolVM';

describe('Function Basics', () => {
  test('Declare and Call Simple Function', () => {
    let source = `
    function test(a, b) {
        return a + b * 10;
    }
    
    var b = test(5, 2);
    `;

    var c = new Compiler();
    
    var prog = c.Compile(source);

    console.log(prog.decompile());
    
    var vm = new SmolVM(source);

    vm.run();

    console.log(vm.globalEnv);

    var x = vm.globalEnv.tryGet('b')!.getValue()!;
    expect(x).toBe(25);


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