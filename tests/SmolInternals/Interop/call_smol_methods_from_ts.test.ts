import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';
import { RunMode } from '../../../src/Internals/RunMode';

describe('Smol Interop Basics', () => {
  test('Call smol method no args', () => {

    const source = `
    var y = 2;

    function moo() {
      return y
    }`;

    const vm = SmolVM.Init(source);
    var r = vm.call('moo');

    expect(r).toBe(2);
  });

  test('Call smol method with some args', () => {

    const source = `
    var y = 2;
    
    function moo(z) {
      return y * z;
    }`;

    const vm = SmolVM.Init(source);
    var r = vm.call('moo', 2, 'x');

    expect(r).toBe(4);
  })

  test('Call smol method before vm has initialised', () => {

    const source = `
    var y = 2;
    
    function moo(z) {
      return y * z;
    }`;

    const vm = SmolVM.Compile(source);

    expect(() => { 
      
      var r = vm.call('moo', 2, 'x'); 

    }).toThrowError('Init() should be used before calling a function, to ensure the vm state is prepared');
  })
  
});