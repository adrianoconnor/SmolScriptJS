import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';
import { CompilerError } from '../../../src/SmolErrorTypes';

describe('SmolInteral Parser', () => {
  test('Handle missing ;', () => {

    const source = `
    var x = false
    var z = 1

    var y = x ? 1 : 2

    function moo() {
      return y
    }

    function moof() { return y }

    function e() {
      return
      return // This is pointless, but we're just testing a specific scenario
    }
    
    e()

    z += moo()
    var yy
    yy = moof()`;

    //Using this for dev tests :) 
    //const tokens = Scanner.tokenize(source);
    //const stmts = Parser.parse(tokens);

    //console.log(tokens);

    const vm = SmolVM.Init(source);

    expect(vm.getGlobalVar("z")).toBe(3);  
    expect(vm.getGlobalVar("yy")).toBe(2); 
  });

  test('Handle missing ; -- prefix operator edge case', () => {

    const source = `
    var a = 10
    var b = --a
    
    ++a
    --a
    --a
    --a
    ++b
    `;

    //Using this for dev tests :) 
    //const tokens = Scanner.tokenize(source);
    //const stmts = Parser.parse(tokens);

    //console.log(tokens);

    const vm = SmolVM.Init(source);

    expect(vm.getGlobalVar("a")).toBe(7);  
    expect(vm.getGlobalVar("b")).toBe(10);
  });

  test('Expect line break in string to fail', () => {

    const source = `var a = 'test
123';`;

    //Using this for dev tests :) 
    //const tokens = Scanner.tokenize(source);
    //const stmts = Parser.parse(tokens);

    //console.log(tokens);

    const t = () => SmolVM.Init(source);

    expect(t).toThrow(CompilerError);
    expect(t).toThrow("Unexpected line break in string on line 1");

  });

  test('Expect unexpected character to fail', () => {

    const source = `var a = 1;
    a = ±5;`;

    const t = () => SmolVM.Init(source);

    expect(t).toThrow(CompilerError);
    expect(t).toThrow("Unexpected character ± at position 9 on line 2");

  });  
});