import { BlockStatement } from "./Statements/BlockStatement";
import { BreakStatement } from "./Statements/BreakStatement";
import { ClassStatement } from "./Statements/ClassStatement";


export interface AstVisitor<R> {
    visitBlockStatement(stmt: BlockStatement): R;
    visitBreakStatement(stmt: BreakStatement): R;
    visitClassStatement(stmt: ClassStatement): R;

 
}