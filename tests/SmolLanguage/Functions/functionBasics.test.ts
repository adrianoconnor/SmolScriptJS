import { describe, expect, test } from '@jest/globals';
import { AstDebugPrinter } from '../../../src/Internals/Ast/AstDebugPrinter';
import { Compiler } from '../../../src/Internals/Compiler';
import { SmolVM } from '../../../src/SmolVM';
import { Scanner } from '../../../src/Internals/Scanner';
import { Token } from '../../../src/Internals/Token';
import { TokenType } from '../../../src/Internals/TokenType';

describe('Function Basics', () => {
  test('Declare and Call Simple Function', () => {
    let source = `
    function test(a, b) {
        return a + b * 10;
    }
    
    var b = test(5, 2);

    var s = '1234';

    var l = s.length;

    `;

    var vm = new SmolVM(source);

    vm.run();

    expect(vm.globalEnv.tryGet('b')!.getValue()!).toBe(25);
    expect(vm.globalEnv.tryGet('l')!.getValue()!).toBe(4);
  }),

  test('Declare and Call Simple Function Expression as a Varable', () => {
    let source = `
    var f = function(a, b) {
        return a + b * 10;
    };
    
    var b = f(5, 2);
    `;

    var vm = new SmolVM(source);

    vm.run();

    var x = vm.globalEnv.tryGet('b');

    expect(x!.getValue()).toBe(25);
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
    
}),

test('Declare class etc', () => {
  let source = `
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
/*
  var t = Scanner.tokenize(source);

  var s = '';
  t.forEach((x) => {
    s += `${TokenType[x.type]} ${x.literal}\n`;
  })

  console.log(s);
*/

  var vm = SmolVM.Init(source);
  
  expect(vm.getGlobalVar('a')).toBe(5);
});



});