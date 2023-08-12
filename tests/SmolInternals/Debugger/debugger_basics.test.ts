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
  })

});