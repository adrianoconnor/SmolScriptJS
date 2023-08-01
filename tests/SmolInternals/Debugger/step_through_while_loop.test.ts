import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';
import { RunMode } from '../../../src/Internals/RunMode';
import { TokenType } from '../../../src/Internals/TokenType';
import { OpCode } from '../../../src/Internals/OpCode';

function getPendingInstr(vm:SmolVM) : string {
  let pending_instr = vm.program.code_sections[vm.code_section][vm.pc];

  let pending_instr_first_token = vm.program.tokens[pending_instr.token_map_start_index as number];
  let pending_instr_last_token = vm.program.tokens[pending_instr.token_map_end_index as number];

  return vm.program.source!.substring(pending_instr_first_token.start_pos, pending_instr_last_token.end_pos);
}

describe('Smol Debug Step-through While Loop', () => {

  test('debug step through of while', () => {

    const source = `
    var y = 0;
    while(y < 10)
      y++;

    while ( y>0 ) {
      y = y - 1;
      var z = 0;
    }
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
    while(y < 9) {
      vm.step();
      expect(vm.getGlobalVar('y')).toBe(++y);
      expect(getPendingInstr(vm)).toBe('y++');
    }
    vm.step();
    expect(vm.getGlobalVar('y')).toBe(++y);
    expect(getPendingInstr(vm)).toBe('while ( y>0 )');
    while(y > 0) {
      vm.step();
      expect(vm.getGlobalVar('y')).toBe(y--);
      expect(getPendingInstr(vm)).toBe('y = y - 1');
      vm.step();
      expect(getPendingInstr(vm)).toBe('var z = 0');
    }
  })

});