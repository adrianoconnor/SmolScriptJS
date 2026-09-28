import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';
import { Token } from '../../Token';
import { Expression } from '../Expressions/Expression';

export class VarStatement extends Statement {
  getStatementType(): string {
    return 'Var';
  }

  name: Token;
  initializerExpression?: Expression;
  firstTokenIndex?: number;
  lastTokenIndex?: number;

  constructor(name: Token, initializerExpression?: Expression) {
    super();
    this.name = name;
    this.initializerExpression = initializerExpression;
    this.firstTokenIndex = undefined;
    this.lastTokenIndex = undefined;
  }

  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitVarStatement(this);
  }
}
