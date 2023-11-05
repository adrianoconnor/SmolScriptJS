import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../src/SmolVM';

function getPendingInstr(vm:SmolVM) : string {
  let pending_instr = vm.program.code_sections[vm.code_section][vm.pc];

  let pending_instr_first_token = vm.program.tokens[pending_instr.token_map_start_index as number];
  let pending_instr_last_token = vm.program.tokens[pending_instr.token_map_end_index as number];

  return vm.program.source!.substring(pending_instr_first_token.start_pos, pending_instr_last_token.end_pos);
}

describe('SmolDevTest', () => {

  test('break and continue', () => {

    const source = `
    var i = 0;

    while(i < 10) {
        i = i + 1;
        if (i < 2)
          continue;
        break;
    }

    i = i + 1;
    `;

    let debugLog = '';

    const vm = SmolVM.Compile(source);

    //console.log(vm.program.decompile());
/*
    vm.onDebugPrint = (str) => { debugLog += `${str}\n` };
    vm.maxCycles = 1000000;
    vm.maxStackSize = 10000;
    vm.run();
    expect(vm.getGlobalVar('f')).toBe(6765);*/
  })

  test('decomp', () => {

    const source = `
    function f(a) {
      return 1;
    }

    f(1);
    `;

    let debugLog = '';

    const vm = SmolVM.Compile(source);

    console.log(vm.program.decompile(false));
/*
    vm.onDebugPrint = (str) => { debugLog += `${str}\n` };
    vm.maxCycles = 1000000;
    vm.maxStackSize = 10000;
    vm.run();
    expect(vm.getGlobalVar('f')).toBe(6765);*/
  })

  test('indexerplusplus', () => {

    const source = `
    var i = 0;
    var a = [0, 1, 2, 3, [0, 1, 2, 3]];

    var r1 = a[++i];
    var r2 = a[i++];
    var r3 = a[++i + 1][2];
   // var r4 = ++a[i];
//    a[i]++;
//    var r4 = a[i];
    `;

    const vm = SmolVM.Init(source);

    expect(vm.getGlobalVar('r1')).toBe(1);
    expect(vm.getGlobalVar('r2')).toBe(1);
    expect(vm.getGlobalVar('r3')).toBe(2);
   // expect(vm.getGlobalVar('r4')).toBe(4);
//    expect(vm.getGlobalVar('r3')).toBe(4);
  })

});