import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';

describe('Smol Interop Basics', () => {
  test('Call smol method no args', () => {

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

    const vm = SmolVM.Init(source);
    var r = vm.call('moo');

    expect(r).toBe(2);
  });
});