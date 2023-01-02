export class Expression {
    accept(visitor:any) {
        return visitor.visit(this);
    }
}