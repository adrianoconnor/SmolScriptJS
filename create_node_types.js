const fs = require('fs');

var statement_types = [
    { 
        name: 'Block', 
        fields: [
            { name:'statements', type:'Statement[]' }
        ] 
    },
    { 
        name: 'Break', 
        fields: [] 
    },
    { 
        name: 'Class', 
        fields: [
            { name:'className', type:'Token' },
            { name:'superclassName', type:'Token', optional:true },
            { name:'functions', type:'FunctionStatement[]' }
        ] 
    },
    { 
        name: 'Continue', 
        fields: [] 
    },
    { 
        name: 'Debugger', 
        fields: [] 
    },
    {
        name: 'Expression', 
        fields: [
            { name:'expression', type:'Expression' }
        ] 
    },
    { 
        name: 'Function', 
        fields: [
            { name:'name', type:'Token', optional: true },
            { name:'parameters', type:'Token[]' },
            { name:'functionBody', type:'BlockStatement' }
        ] 
    },
    { 
        name: 'If', 
        fields: [
            { name:'expression', type:'Expression' },
            { name:'thenStatement', type:'Statement' },
            { name:'elseStatement', type:'Statement', optional: true }
        ] 
    },
    { 
        name: 'Print', 
        fields: [
            { name:'expression', type:'Expression' }
        ] 
    },
    { 
        name: 'Return', 
        fields: [
            { name:'expression', type:'Expression', optional: true }
        ] 
    },
    { 
        name: 'Throw', 
        fields: [
            { name:'expression', type:'Expression', optional: true }
        ] 
    },
    { 
        name: 'Try', 
        fields: [
            { name:'tryBody', type:'BlockStatement' },
            { name:'exceptionVariableName', type:'Token', optional: true },
            { name:'catchBody', type:'BlockStatement', optional: true },
            { name:'finallyBody', type:'BlockStatement', optional: true }
        ] 
    },
    { 
        name: 'Var', 
        fields: [
            { name:'name', type:'Token' },
            { name:'initializerExpression', type:'Expression', optional:true }
        ] 
    },
    { 
        name: 'While', 
        fields: [
            { name:'whileCondition', type:'Expression' },
            { name:'executeStatement', type:'Statement' }
        ]
    },

];

var expression_types = [];

// Create statement files

statement_types.forEach(function(st) {
    console.log(st.name);

    var fields = '';
    var ctorParams = '';
    var ctorAssigns = '';

    st.fields.forEach(function(f) {
        fields += `    _${f.name}${f.optional ? '?':''}:${f.type};\n`;
        ctorParams += `${ctorParams.length > 0 ? ', ':''}${f.name}${f.optional ? '?':''}:${f.type}`
        ctorAssigns += `        this._${f.name} = ${f.name};\n`;
    })

    var classDefn = `import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";
import { Token } from "../../Token";

export class ${st.name}Statement implements Statement {

    getStatementType() : string {
        return "${st.name}";
    }

${fields}
    constructor(${ctorParams}) {
${ctorAssigns}
    }

    accept(visitor:any) {
        return visitor.visitExpressionStatement(this);
    }
}`

if (st.name == "Function") {
console.log(classDefn);
}

});
