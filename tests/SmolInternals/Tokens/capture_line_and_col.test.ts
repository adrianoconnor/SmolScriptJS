import { describe, expect, test } from '@jest/globals';
import { Scanner } from '../../../src/Internals/Scanner'
import { TokenType } from '../../../src/Internals/TokenType';

describe('SmolInteral Token line and char pos', () => {
  test('Single Line Test 1', () => {

    const source = `var a = 1;`
    const tokens = Scanner.tokenize(source);

    expect(tokens.length).toBe(6); // This is comparing object instances, which are not the same
    
    expect(tokens[0].line).toBe(1);
    expect(tokens[0].col).toBe(0);
    expect(tokens[0].start_pos).toBe(0);
    expect(tokens[0].end_pos).toBe(3);

    expect(tokens[1].line).toBe(1);
    expect(tokens[1].col).toBe(4);
    expect(tokens[1].start_pos).toBe(4);
    expect(tokens[1].end_pos).toBe(5);

    expect(tokens[2].line).toBe(1);
    expect(tokens[2].col).toBe(6);
    expect(tokens[2].start_pos).toBe(6);
    expect(tokens[2].end_pos).toBe(7);

    expect(tokens[3].line).toBe(1);
    expect(tokens[3].col).toBe(8);
    expect(tokens[3].start_pos).toBe(8);
    expect(tokens[3].end_pos).toBe(9);

    expect(tokens[4].line).toBe(1);
    expect(tokens[4].col).toBe(9);
    expect(tokens[4].start_pos).toBe(9);
    expect(tokens[4].end_pos).toBe(10);

    expect(tokens[5].line).toBe(1);
    expect(tokens[5].col).toBe(10);
  });

  test('Multiline Test 1', () => {

    const source = `var a = 1;

function x() {
    a = a + 1;
}
`
    const tokens = Scanner.tokenize(source);

    expect(tokens.length).toBe(18); // This is comparing object instances, which are not the same
    
    // Now check detail of the literal 'x'
    expect(tokens[6].line).toBe(3);
    expect(tokens[6].col).toBe(9);
    expect(tokens[6].start_pos).toBe(21);
    expect(tokens[6].end_pos).toBe(22);    
  });

  test('Multiline Test 2', () => {

    const source = `var a = 1;

/*
Multiline comment
*/

function fnName() {
    a = a + 1;
}
`
    const tokens = Scanner.tokenize(source);

    expect(tokens.length).toBe(18);
    
    // Now check detail of the literal 'fnName'
    expect(tokens[6].line).toBe(7);
    expect(tokens[6].col).toBe(9);
    expect(tokens[6].start_pos).toBe(46);
    expect(tokens[6].end_pos).toBe(52);
    expect(tokens[6].lexeme).toBe('fnName');
    expect(tokens[6].type).toBe(TokenType.IDENTIFIER);
  });

});