import { Enviornment } from "./Environment";
import { Interpreter } from "./Interpreter";
import { FunctionStatement } from "./Statements/FunctionStatement";

export interface ICallable {
    call(interpreter:Interpreter, args:any[]) : any;
}

export class ReturnFromFunction extends Error {

    _returnValue?:any;

    constructor(returnValue?:any) {
        super();
        this._returnValue = returnValue;
    }
}

export class UserDefinedFunction implements ICallable {

    _declaration:FunctionStatement;
    _enclosingEnv:Enviornment;

    constructor(declaration:FunctionStatement, enclosingEnv:Enviornment) {
        this._declaration = declaration;
        this._enclosingEnv = enclosingEnv;
    }

    call(interpreter:Interpreter, args:any[]) : any {

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
                return (r as ReturnFromFunction)._returnValue;
            }

            throw r;
        }
    }

}