import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';

function getPendingInstr(vm: SmolVM): string {
  let pendingInstr = vm.program.codeSections[vm.activeCodeSection][vm.pc];

  let pendingInstrFirstToken = vm.program.tokens[pendingInstr.tokenMapStartIndex as number];
  let pendingInstrLastToken = vm.program.tokens[pendingInstr.tokenMapEndIndex as number];

  return vm.program.source!.substring(
    pendingInstrFirstToken.startPos,
    pendingInstrLastToken.endPos
  );
}

describe('TDD', () => {
  test('tdd', () => {
    const source = `
    var y = 0;

    for(var x = 0; x < 1; x++) {
      y += x;
    }

    `;

    const vm = SmolVM.Compile(source);
    //console.log(source);
    //console.log(vm.decompile());

    vm.step(); // Step into the program
    expect(vm.getGlobalVar('y')).toBeUndefined();
    expect(getPendingInstr(vm)).toBe('var y = 0');
    vm.step();
    expect(getPendingInstr(vm)).toBe('var x = 0');
    vm.step();
    expect(getPendingInstr(vm)).toBe('x < 1');
    vm.step();
    expect(getPendingInstr(vm)).toBe('{');
    vm.step();
    expect(getPendingInstr(vm)).toBe('y += x');
    vm.step();
    expect(getPendingInstr(vm)).toBe('}');
    vm.step();
    expect(getPendingInstr(vm)).toBe('x++');
    vm.step();
    expect(getPendingInstr(vm)).toBe('x < 1');
    vm.step();
    vm.step();
    vm.step();
  });
});
