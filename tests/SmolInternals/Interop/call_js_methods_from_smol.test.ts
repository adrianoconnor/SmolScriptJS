import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';

describe('Smol Interop Basics', () => {
  test('Call js method no args', () => {

    const source = `var x = moo();`;

    const vm = SmolVM.Compile(source);

    vm.registerMethod('moo', () => {
      return 2;
    });

    vm.run();

    expect(vm.getGlobalVar('x')).toBe(2);
  });

  test('Call js method with basic args', () => {

    const source = `var x = moo(3, 'x');`;

    const vm = SmolVM.Compile(source);

    vm.registerMethod('moo', (n:number, s:string) : number => {
      return n * 3;
    });

    vm.run();

    expect(vm.getGlobalVar('x')).toBe(9);
  });
});