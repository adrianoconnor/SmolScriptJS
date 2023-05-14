/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class Statement {

    getStatementType() : string {
        throw new Error("Should not be called on base");
    }    

    accept(visitor:any) : any {
        throw new Error("Should not be called on base");
    }
}
