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

    // This won't work:
    function moof() { return y }

    function e() {
      // return // This currently won't work
    }
    
    e()

    z += moo()
    `;

    //Using this for dev tests :) 
    //const tokens = Scanner.tokenize(source);
    //const stmts = Parser.parse(tokens);

    const vm = SmolVM.Init(source);

    expect(vm.getGlobalVar("z")).toBe(3);  
  });
});