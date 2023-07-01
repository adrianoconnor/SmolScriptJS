import { ISmolNativeCallable } from "./ISmolNativeCallable";
import { SmolVariableType } from "./SmolVariableType";
import { SmolString } from "./SmolString";
import { SmolBool } from "./SmolBool";

export class SmolRegExp extends ISmolNativeCallable {
    
    _pattern:string;
    _regex:RegExp;

    constructor(value:string) {
        super();
        this._pattern = value;
        this._regex = new RegExp(value);
    }

    getValue():SmolRegExp
    {
        return this;
    }

    toString():string
    {
        return `(SmolRegExp) ${this._pattern}`;
    }

    setProp(name:string): void {
        throw new Error(`Property setting ${name} does not apply to SmolRegExp`);
    }

    getProp(name:string): SmolVariableType {
        throw new Error(`Can't get property ${name} on SmolRegExp`);
    }

    nativeCall(funcName:string, parameters:SmolVariableType[]) : SmolVariableType {

        if (funcName == "test") {

            const s1 = parameters[0] as SmolString;

            return new SmolBool(this._regex.test(s1.getValue()));
        }

        throw new Error();
    }

    static staticCall(funcName:string , parameters:SmolVariableType[]): SmolVariableType
    {
        switch (funcName)
        {
            case "constructor":
            {
                const s1 = parameters[0] as SmolString;

                return new SmolRegExp(s1.getValue());
            }
            default:
                throw new Error(`Object class cannot handle static function ${funcName}`);
        }
    }
}