export class Statement {

    accept(visitor:any) {
        return visitor.visit(this);
    }
}
