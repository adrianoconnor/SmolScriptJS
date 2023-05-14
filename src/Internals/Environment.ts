import { SmolVariableType } from "./SmolVariableTypes/SmolVariableType";

export class Environment {

    enclosing?:Environment;
    private _variables: { [name:string] : SmolVariableType };

    constructor(enclosing?:Environment) {
        this._variables = {};
        this.enclosing = enclosing;
    }

    public define(name:string, value:SmolVariableType) {
        this._variables[name] = value;
    }

    public assign(name:string, value:SmolVariableType, isThis = false) {
        if (this._variables[name] != undefined) {
            this._variables[name] = value;
        }
        else if (isThis) {
            this.define(name, value);
        }
        else if (this.enclosing != undefined) {
            this.enclosing.assign(name, value);
        }
        else {
            throw new Error("Variable undefined");
        }
    }

    public get(name:string) : SmolVariableType {
        if (this._variables[name] != undefined) {
            return this._variables[name];
        }
        else if (this.enclosing != undefined) {
            return this.enclosing.get(name);
        }
        else {
            throw new Error("Variable undefined");
        }
    }

    public tryGet(name:string) : SmolVariableType|undefined {
        if (this._variables[name] != undefined) {
            return this._variables[name];
        }
        else if (this.enclosing != undefined) {
            return this.enclosing.tryGet(name);
        }
        else {
            return undefined;
        }
    }
}