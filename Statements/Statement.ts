export class Statement {

    getStatementType() : string {
        throw new Error("Should not be called on base");
    }    

    accept(visitor:any) {
        throw new Error("Should not be called on base");
    }
}
