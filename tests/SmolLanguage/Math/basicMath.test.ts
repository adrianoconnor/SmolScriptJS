import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../../../src/SmolVM';

describe('Math Basics', () => {
    test('Simple Bidmas Test #1', () => {
        let source = `var a = 2 * 3 * 5 / 5;`;

        var vm = SmolVM.Init(source);

        expect(vm.getGlobalVar('a')).toBe(6);
    }),

    test('Create var and initialise as number', () => {
        let source = `var b = 6;`;

        var vm = SmolVM.Init(source);

        vm.onDebugPrint = console.log;

        expect(vm.getGlobalVar('b')).toBe(6);
    })
});