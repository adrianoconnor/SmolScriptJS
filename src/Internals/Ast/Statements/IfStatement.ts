import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';
import { Expression } from '../Expressions/Expression';

export class IfStatement extends Statement {
  getStatementType(): string {
    return 'If';
  }

  expression: Expression;
  thenStatement: Statement;
  elseStatement?: Statement;

  constructor(expression: Expression, thenStatement: Statement, elseStatement?: Statement) {
    super();
    this.expression = expression;
    this.thenStatement = thenStatement;
    this.elseStatement = elseStatement;
  }

  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitIfStatement(this);
  }

  // For source mapping

  exprFirstTokenIndex?: number;
  exprLastTokenIndex?: number;
  thenFirstTokenIndex?: number;
  thenLastTokenIndex?: number;
  elseFirstTokenIndex?: number;
  elseLastTokenIndex?: number;
}
