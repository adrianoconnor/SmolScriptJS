export class Expression {
    accept(visitor:any) : any {
        throw new Error("Should not be called on base");
    }
}