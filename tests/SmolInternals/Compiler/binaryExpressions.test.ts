import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';

describe('SmolInteral BinaryExpression Compilation', () => {
  test('Simple Tests', () => {

    const source = `
    var a = (10 + 5) * 2;
    `;

    const vm = SmolVM.Init(source);

    expect(vm.getGlobalVar('a')).toBe(30);
    expect(vm.getGlobalVar('b')).toBeUndefined();    
  });
});