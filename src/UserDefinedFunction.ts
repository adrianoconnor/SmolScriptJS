/*import { Enviornment } from "./Internals/Environment";
import { SmolEngine } from "./SmolEngine";
import { FunctionStatement } from "./Internals/Ast/Statements/FunctionStatement";

export interface ICallable {
    call(interpreter:SmolEngine, args:any[]) : any;
}

export class ReturnFromFunction extends Error {

    returnValue?:any;

    constructor(returnValue?:any) {
        super();
        this.returnValue = returnValue;
    }
}

export class UserDefinedFunction implements ICallable {

    private _declaration:FunctionStatement;
    private _enclosingEnv:Enviornment;

    constructor(declaration:FunctionStatement, enclosingEnv:Enviornment) {
        this._declaration = declaration;
        this._enclosingEnv = enclosingEnv;
    }

    call(interpreter:SmolEngine, args:any[]) : any {

        var newEnv = new Enviornment(this._enclosingEnv);

        for(var i = 0; i < this._declaration._parameters.length; i++) {
            if (args.length > i)
            {
                var anonymousFunction = args[i] as FunctionStatement;

                if (anonymousFunction != null)
                {
                    newEnv.define(this._declaration._parameters[i].lexeme, new UserDefinedFunction(anonymousFunction, newEnv));
                }
                else
                {
                    newEnv.define(this._declaration._parameters[i].lexeme, args[i]);
                }
            }
            else
            {
                newEnv.define(this._declaration._parameters[i].lexeme, null);
            }
        }

        try {
            interpreter.executeBlock(this._declaration._block._statements, newEnv);
        }
        catch(r) {
            if ((r as ReturnFromFunction) != null) {
                return (r as ReturnFromFunction).returnValue;
            }

            throw r;
        }
    }

}*/