import { describe, expect, test } from '@jest/globals';
import { AstDebugPrinter } from '../src/Internals/Ast/AstDebugPrinter';
import { Compiler } from '../src/Internals/Compiler';
import { SmolVM } from '../src/SmolVM';

describe('Scratch Pad', () => {
  test('Dev', () => {
    const source = `
      var s = 'Test String';
      //print(s.length);
      //print(s);
      //s.notReal = 1;
    `;

    const vm = SmolVM.Init(source);

    expect(vm.getGlobalVar('s')).toBe('Test String');
  });
});