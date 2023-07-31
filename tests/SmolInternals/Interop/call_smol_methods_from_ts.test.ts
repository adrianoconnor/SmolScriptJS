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




  test('debug step through', () => {

    const source = `
    debugger;
    var y = 2;

    moo(2);
    
    moo(2);

    var z = y / 2;

    function moo(z) {
      y = y * z;
    }`;

    const vm = SmolVM.Compile(source);

    vm.run();

    // we just hit the debugger

    // Currently the debugger statement halts /after/ the debugger keyword, so the next
    // step will be on the following statement. That's not quite how it works in browsers (IIRC)
    // so we probably want it to halt on the debugger statement itself (so the first 'step'
    // runs a NOP to move on from debugger to the next statement. TBC, it's not that important
    // right now.

    // expect current highlighted code to be line 3, var y = 2
    // expect(vm.state).toBe('paused');
    // expect(vm.highlightedSection).toBe('var y = 2');

    expect(vm.getGlobalVar('y')).toBeUndefined;

    vm.step(); // var y = 2 executed

    expect(vm.getGlobalVar('y')).toBe(2);

    // expect current active code to be line 12, inside the function body! This is not yet implemented

    vm.step() // moo(2) executed

    vm.step(); // y = y * z (in function) executed

    // expect current active code to be line 12, inside the function body! This is not yet implemented

    expect(vm.getGlobalVar('y')).toBe(4);

    vm.step() // moo(2) executed

    vm.step(); // y = y * z (in function) executed

    expect(vm.getGlobalVar('y')).toBe(8);

    vm.step(); // var z = y / 2; executed

    expect(vm.getGlobalVar('z')).toBe(4);

  })
});