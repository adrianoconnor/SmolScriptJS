import { SmolBool } from "./SmolBool";
import { SmolNull } from "./SmolNull";
import { SmolNumber } from "./SmolNumber";
import { SmolString } from "./SmolString";
import { SmolVariableType } from "./SmolVariableType";

export class SmolVariableCreator {

    static create(value:any) : SmolVariableType
    {
        if (value == null)
        {
            return new SmolNull();
        }
        else
        {
            var tryCastValue = value as SmolVariableType;

            if (tryCastValue != null)
            {
                return tryCastValue;
            }
            else
            {
                var t = value.GetType();

                if (typeof value == "string")
                {
                    return new SmolString(value as string);
                }
                else if (typeof value == "number")
                {
                    return new SmolNumber(value as number);
                }                
                else if (typeof value == "boolean")
                {
                    return new SmolBool(value as boolean);
                }

                throw new Error(`Could not create a valid stack value from: ${value} (type = ${typeof value})`);
            }
        }
    }
}