import { describe, expect, test } from '@jest/globals';
import { Scanner } from '../../../src/Internals/Scanner'
import { Parser } from '../../../src/Internals/Parser'
import { VarStatement } from '../../../src/Internals/Ast/Statements/VarStatement';
import { FunctionStatement } from '../../../src/Internals/Ast/Statements/FunctionStatement';
import { ExpressionStatement } from '../../../src/Internals/Ast/Statements/ExpressionStatement';

describe('SmolInteral Token line and char pos in AST', () => {
  
  test('Multiline Test 1', () => {

    const source = `var a = 1;

function x() {
    c = a + 2;
}
`
    const tokens = Scanner.tokenize(source);
    const stmts = Parser.parse(tokens);

    expect(stmts.length).toBe(2); 

    // Now check what's in the ast data

    expect(stmts[0].getStatementType()).toBe("Var");

    const varStmt = stmts[0] as VarStatement;

    expect(varStmt.firstTokenIndex).toBe(0);
    expect(varStmt.lastTokenIndex).toBe(3);

    expect(tokens[varStmt.firstTokenIndex ?? -1].lexeme).toBe('var');
    expect(tokens[varStmt.lastTokenIndex ?? -1].lexeme).toBe('1');

    expect(stmts[1].getStatementType()).toBe("Function");

    const funcStmt = stmts[1] as FunctionStatement;

    expect(funcStmt.functionBody.statements.length).toBe(1);

    expect(funcStmt.functionBody.statements[0].getStatementType()).toBe("Expression");

    const exprStmt = funcStmt.functionBody.statements[0] as ExpressionStatement;

    expect(exprStmt.firstTokenIndex ?? -1 ).toBe(10);
    expect(exprStmt.lastTokenIndex ?? -1).toBe(14);

    expect(tokens[exprStmt.firstTokenIndex ?? -1].lexeme).toBe('c');
    expect(tokens[exprStmt.lastTokenIndex ?? -1].lexeme).toBe('2');
  });


});