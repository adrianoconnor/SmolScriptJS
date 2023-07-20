import { ISmolNativeCallable } from "./ISmolNativeCallable";
import { SmolNumber } from "./SmolNumber";
import { SmolRegExp } from "./SmolRegExp";
import { SmolVariableType } from "./SmolVariableType";

export class SmolString extends ISmolNativeCallable {
    
    _value:string;

    constructor(value:string) {
        super();
        this._value = value;
    }

    getValue():string
    {
        return this._value;
    }

    toString():string
    {
        return `(SmolString) ${this._value}`;
    }

    setProp(name:string): void {
        throw new Error(`Property setting ${name} does not apply to String`);
    }

    getProp(name:string): SmolVariableType {
        if (name == "length") {
            //throw new Error(this._value.toString().length);
            return new SmolNumber(this._value.toString().length);
        }

        throw new Error(`Can't get property ${name} on SmolString`);
    }

    nativeCall(funcName:string, parameters:SmolVariableType[]) : SmolVariableType {

        if (funcName === "search") {
            const regex = parameters[0] as SmolRegExp;

            return new SmolNumber(this._value.search(regex._regex));
        }
        else if (funcName === "substring") {
            const p1 = parameters[0] as SmolNumber;
            
            if (parameters.length == 1) {
                return new SmolString(this._value.substring(p1._value));
            }
            else {
                const p2 = parameters[1] as SmolNumber;            
                return new SmolString(this._value.substring(p1._value, p2._value));
            }
        }
        else if (funcName === "indexOf") {
            const p1 = parameters[0] as SmolString;
            
            return new SmolNumber(this._value.indexOf(p1._value));
        }

        throw new Error(`String does not have function '${funcName}'`);
    }

    static staticCall(funcName:string , parameters:SmolVariableType[]): SmolVariableType
    {
        switch (funcName)
        {
            case "constructor":
                {
                    if (parameters.length == 1) {
                        return new SmolString((parameters[0] as SmolString)._value);
                    }
                    else {
                        return new SmolString('');
                    }
                }

            default:
                throw new Error(`Object class cannot handle static function ${funcName}`);
        }
    }
}