export enum OpCode {

    NOP,

    LABEL,
    CALL,
    RETURN,

    ADD,
    SUB,
    DIV,
    MUL,
    POW,
    REM,

    EQL,
    NEQ,
    LT,
    LTE,
    GT,
    GTE,

    BITWISE_AND,
    BITWISE_OR,

    JMPTRUE,
    JMPFALSE,
    JMP,

    DECLARE,

    CONST, // op1: Const index (number), op2: NA
    FETCH,

    STORE,

    ENTER_SCOPE,
    LEAVE_SCOPE,

    TRY,
    CATCH,
    THROW,

    NEW,

    POP_AND_DISCARD,
    DUPLICATE_VALUE,

    LOOP_EXIT,
    LOOP_START,
    LOOP_END,

    CREATE_OBJECT,


    PRINT, // op1: NA, op2: NA
    DEBUGGER,

    START,
    EOF

}