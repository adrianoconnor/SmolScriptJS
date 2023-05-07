export class ScannerError
{
    public errorMessage: string;
    public line: number;
    public charPos: number;

    constructor(errorMessage:string, line:number, charPos:number)
    {
        this.errorMessage = errorMessage;
        this.line = line;
        this.charPos = charPos;
    }

}