import { describe, expect, test } from '@jest/globals';
import { Compiler } from '../../../src/Internals/Compiler';

describe('SmolInteral BinaryExpression Compilation', () => {
  test('Simple Tests', () => {

    let source = `
    (10 + 5) * 2;
    `;

    var c = new Compiler();

    var prog = c.Compile(source);

    console.log(prog.decompile()); 
  });
});