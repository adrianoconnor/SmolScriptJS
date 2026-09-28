import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';
import { Expression } from '../Expressions/Expression';

export class ReturnStatement extends Statement {
  getStatementType(): string {
    return 'Return';
  }

  expression?: Expression;

  constructor(expression?: Expression) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitReturnStatement(this);
  }

  tokenIndex?: number;
  exprFirstTokenIndex?: number;
  exprLastTokenIndex?: number;
}
