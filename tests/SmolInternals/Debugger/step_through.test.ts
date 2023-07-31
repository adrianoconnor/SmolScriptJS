import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';
import { RunMode } from '../../../src/Internals/RunMode';
import { TokenType } from '../../../src/Internals/TokenType';
import { OpCode } from '../../../src/Internals/OpCode';

describe('Smol Denug Basics', () => {

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

    var pending_instr = vm.program.code_sections[vm.code_section][vm.pc];

    var pending_instr_first_token = vm.program.tokens[pending_instr.token_map_start_index as number];
    var pending_instr_last_token = vm.program.tokens[pending_instr.token_map_end_index as number];

    expect(pending_instr_first_token.line).toBe(3);
    expect(pending_instr_first_token.type).toBe(TokenType.VAR);

    expect(pending_instr_last_token.line).toBe(3);
    expect(pending_instr_last_token.type).toBe(TokenType.NUMBER);
    expect(pending_instr_last_token.literal).toBe("2");

    expect(pending_instr_first_token.col).toBe(4);
    expect(pending_instr_last_token.col).toBe(12);
    
    expect(pending_instr_first_token.start_pos).toBe(19);
    expect(pending_instr_last_token.end_pos).toBe(28);

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