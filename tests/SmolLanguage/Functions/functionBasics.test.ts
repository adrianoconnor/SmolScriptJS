import { describe, expect, test } from '@jest/globals';
import { AstDebugPrinter } from '../../../src/Internals/Ast/AstDebugPrinter';
import { SmolVM } from '../../../src/SmolVM';

describe('Function Basics', () => {
  test('Declare and Call Simple Function', () => {
    const source = `
    function test(a, b) {
        return a + b * 10;
    }
    
    var b = test(5, 2);
    var s = '1234';
    var l = s.length;

    `;

    const vm = SmolVM.Init(source);

    expect(vm.getGlobalVar('b')).toBe(25);
    expect(vm.getGlobalVar('l')).toBe(4);
  }),

  test('Declare and Call Simple Function Expression as a Varable', () => {
    const source = `
    var f = function(a, b) {
        return a + b * 10;
    };
    
    var b = f(5, 2);
    `;

    const vm = new SmolVM(source);

    vm.run();

    const x = vm.globalEnv.tryGet('b');

    expect(x!.getValue()).toBe(25);
  }),
  
  test('Declare and Call Simple Function - Generate AST', () => {
    const source = `
    function test(a) {
        return a + 10;
    }
    
    var b = test(5);
    `;

    const ast = AstDebugPrinter.parse(source);

    expect(ast).toBe(`[function name=test]
  param 0: a
  [block]
    [return expr:(+ (var a) (literal (SmolNumber) 10))]
  [/block]
[/functionExpression]
[declare var b initializer:(call (var test) with 1 args)]
`);
    
}),

test('Declare class etc', () => {
  const source = `
  class testClass {
    constructor() {
      this.x = 5;
    }

    getTest() {
      return this.x;
    }
}

var c = new testClass();

var a = c.getTest();
  `;

  const vm = SmolVM.Init(source);
  
  expect(vm.getGlobalVar('a')).toBe(5);
});



});