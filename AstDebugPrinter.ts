import { AssignmentExpression } from "./Expressions/AssignmentExpression";
import { BinaryExpression } from "./Expressions/BinaryExpression";
import { GroupingExpression } from "./Expressions/GroupingExpression";
import { LiteralExpression } from "./Expressions/LiteralExpression";
import { VariableExpression } from "./Expressions/VariableExpression";
import { ExpressionStatement } from "./Statements/ExpressionStatement";
import { Statement } from "./Statements/Statement";
import { VarStatement } from "./Statements/VarStatement";

export class AstDebugPrinter {

    print(s:Statement) {
        console.log(s.accept(this));   
    }

    visitVarStatement(stmt:VarStatement) {
        return (`(var ${stmt._name.lexeme} = ${stmt._expression.accept(this)})`);
    }

    visitExpressionStatement(stmt:ExpressionStatement) {
        return (`(expr ${stmt._expression.accept(this)})`);
    }

    visitAssignmentExpression(expr:AssignmentExpression) {
        return (`(assign ${expr._name.lexeme} ${expr._value.accept(this)})`);
    }

    visitBinaryExpression(expr:BinaryExpression) {
        return (`(${expr._operand.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    visitGroupingExpression(expr:GroupingExpression) {

        return (`(group ${expr._expr.accept(this)})`);
    }

    visitLiteralExpression(expr:LiteralExpression) {
        return (`${expr._value == null ? "nil" : expr._value.toString()}`);
    }

    visitVariableExpression(expr:VariableExpression) {
        return (`(var ${expr._name.lexeme})`);
    }
}