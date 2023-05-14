/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class Expression {
    accept(visitor:any) : any {
        throw new Error("Should not be called on base");
    }
}