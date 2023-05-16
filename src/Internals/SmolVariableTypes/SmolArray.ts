import { SmolVariableType } from "./SmolVariableType";
import { ISmolNativeCallable } from "./ISmolNativeCallable";
import { SmolNumber } from "./SmolNumber";
import { SmolUndefined } from "./SmolUndefined";
import { SmolString } from "./SmolString";

export class SmolArray extends ISmolNativeCallable {
    
    array:SmolVariableType[] = [];

    constructor() {
        super();
    }

    getValue():SmolVariableType {
        return this;
    }

    toString() {
        return `SmolArray (length = ${this.array.length}`;
    }

    getProp(propName:string):SmolVariableType
    {
        switch (propName)
        {
            case "length":
                return new SmolNumber(this.array.length);

            default:

                if (String(propName).match(/[0-9]+/))
                {
                    return this.array[parseInt(propName)] ?? new SmolUndefined();
                }

                throw new Error(`Array does not contain property ${propName}`);
        }
    }

    setProp(propName:string, value:SmolVariableType):void
    {
        if (String(propName).match(/[0-9]+/))
        {
            const index = parseInt(propName);
/*
            while (index > this.array.length - 1)
            {
                this.array.push(new SmolUndefined());

                index += 1;
            }
*/
            this.array[index] = value;
        }
        else
        {
            throw new Error("Not a valid index");
        }
    }

    nativeCall(funcName:string, parameters:SmolVariableType[]): SmolVariableType
    {
        switch (funcName)
        {
            case 'pop':
            {
                const val = this.array.pop();

                return val != undefined ? val : new SmolUndefined();
            }

            case 'push':
                this.array.push(parameters[0]);
                return parameters[0];

            default:
                throw new Error(`Array cannot handle native function ${funcName}`);
        }
    }

    static staticCall(funcName:string, parameters:SmolVariableType[]): SmolVariableType
    {
        switch (funcName)
        {
            case 'constructor':
            {
                const obj = new SmolArray();

                parameters.forEach((p) => 
                {
                    obj.array.push(p);
                });

                return obj;
            }
            default:
                throw new Error(`"Array class cannot handle static function ${funcName}`);
        }
    }


}