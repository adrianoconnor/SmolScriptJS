import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';
import { Scanner } from '../../../src/Internals/Scanner';
import { Parser } from '../../../src/Internals/Parser';

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
});