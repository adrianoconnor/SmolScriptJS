import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

export class BlockStatement extends Statement {
  getStatementType(): string {
    return 'Block';
  }

  statements: Statement[];
  insertedByParser: boolean; // This means it was inserted by the parser to support a scope that is required by convention butnot explicitly given

  blockStartTokenIndex?: number;
  blockEndTokenIndex?: number;

  constructor(statements: Statement[], isVirtual = false) {
    super();
    this.statements = statements;
    this.insertedByParser = isVirtual;
  }

  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitBlockStatement(this);
  }
}
