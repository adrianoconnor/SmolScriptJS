import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';

function getPendingInstr(vm: SmolVM): string {
  let pending_instr = vm.program.codeSections[vm.activeCodeSection][vm.pc];

  let startToken = vm.program.tokens[pending_instr.tokenMapStartIndex as number];
  let endToken = vm.program.tokens[pending_instr.tokenMapEndIndex as number];

  return vm.program.source!.substring(startToken.startPos, endToken.endPos);
}

describe('Smol Debug Step-through While Loop', () => {
  test('debug step through of while', () => {
    const source = `
    var y = 0;
    while(y < 10)
      y++;

    while ( y>2 ) { // Weird formatting just to check it carries over correctly
      y = y - 1;
      var z = 0;
    }

    while(true) {
      y = y - 1;
      if (y == 0)
        break;
      else
        continue;
      y = 0;
    }

    var t = 0;
    `;

    // If you put an empty block {} inside the while, it breaks this test completely

    const vm = SmolVM.Compile(source);

    vm.step();
    expect(vm.getGlobalVar('y')).toBeUndefined;
    expect(getPendingInstr(vm)).toBe('var y = 0');
    vm.step();
    expect(vm.getGlobalVar('y')).toBe(0);
    expect(getPendingInstr(vm)).toBe('while(y < 10)');
    vm.step();
    expect(vm.getGlobalVar('y')).toBe(0);
    expect(getPendingInstr(vm)).toBe('y++');
    var y = 0;
    while (y < 9) {
      vm.step();
      expect(vm.getGlobalVar('y')).toBe(++y);
      expect(getPendingInstr(vm)).toBe('while(y < 10)');
      vm.step();
      expect(getPendingInstr(vm)).toBe('y++');
    }
    vm.step();
    expect(vm.getGlobalVar('y')).toBe(++y);
    expect(getPendingInstr(vm)).toBe('while(y < 10)');
    vm.step();
    expect(getPendingInstr(vm)).toBe('while ( y>2 )');
    while (y > 2) {
      vm.step();
      expect(getPendingInstr(vm)).toBe('{');
      vm.step();
      expect(vm.getGlobalVar('y')).toBe(y--);
      expect(getPendingInstr(vm)).toBe('y = y - 1');
      vm.step();
      expect(getPendingInstr(vm)).toBe('var z = 0');
      vm.step();
      expect(getPendingInstr(vm)).toBe('}');
      vm.step();
      expect(getPendingInstr(vm)).toBe('while ( y>2 )');
    }

    vm.step();
    expect(getPendingInstr(vm)).toBe('while(true)');
    vm.step();
    expect(getPendingInstr(vm)).toBe('{');
    vm.step();
    expect(getPendingInstr(vm)).toBe('y = y - 1');
    vm.step();
    expect(vm.getGlobalVar('y')).toBe(1);
    expect(getPendingInstr(vm)).toBe('if (y == 0)');
    vm.step();
    expect(getPendingInstr(vm)).toBe('continue');
    vm.step();
    expect(getPendingInstr(vm)).toBe('while(true)');
    vm.step();
    expect(getPendingInstr(vm)).toBe('{');
    vm.step();
    expect(getPendingInstr(vm)).toBe('y = y - 1');
    vm.step();
    expect(vm.getGlobalVar('y')).toBe(0);
    expect(getPendingInstr(vm)).toBe('if (y == 0)');
    vm.step();
    expect(getPendingInstr(vm)).toBe('break');
    vm.step();
    expect(getPendingInstr(vm)).toBe('var t = 0');
  });
});
