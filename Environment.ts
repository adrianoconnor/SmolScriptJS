export class Enviornment {

    _enclosing?:Enviornment;
    _variables: { [name:string] : any };

    constructor(enclosing?:Enviornment) {
        this._variables = {};
        this._enclosing = enclosing;
    }

    define(name:string, value:any) {
        this._variables[name] = value;
    }

    assign(name:string, value:any) {
        if (this._variables[name] != undefined) {
            this._variables[name] = value;
        }
        else if (this._enclosing != undefined) {
            this._enclosing.assign(name, value);
        }
        else {
            throw new Error("Variable undefined");
        }
    }

    get(name:string) : any {
        if (this._variables[name] != undefined) {
            return this._variables[name];
        }
        else if (this._enclosing != undefined) {
            return this._enclosing.get(name);
        }
        else {
            throw new Error("Variable undefined");
        }
    }
}