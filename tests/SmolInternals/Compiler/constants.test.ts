import { describe, expect, test } from '@jest/globals';
import { Compiler } from '../../../src/Internals/Compiler';

describe('SmolInteral BinaryExpression Compilation', () => {
  test('Simple Tests', () => {

    const source = `
    var x = false;
    var z = 1;

    var y = x ? 1 : 2;
    
    function moo() {
        print 'moo';
        return;
    }
    
    moo();
    `;

    const c = new Compiler();
    const prog = c.Compile(source);

    expect(prog.constants.length).toBe(5);
  });
});