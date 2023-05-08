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
        ],
        imports: ['Token', 'FunctionStatement']
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
        ],
        imports: ['Expression']
    },
    { 
        name: 'Function', 
        fields: [
            { name:'name', type:'Token' },
            { name:'parameters', type:'Token[]' },
            { name:'functionBody', type:'BlockStatement' }
        ],
        imports: ['Token', 'BlockStatement']
    },
    { 
        name: 'If', 
        fields: [
            { name:'expression', type:'Expression' },
            { name:'thenStatement', type:'Statement' },
            { name:'elseStatement', type:'Statement', optional: true }
        ],
        imports: ['Expression']
    },
    { 
        name: 'Print', 
        fields: [
            { name:'expression', type:'Expression' }
        ],
        imports: ['Expression']
    },
    { 
        name: 'Return', 
        fields: [
            { name:'expression', type:'Expression', optional: true }
        ],
        imports: ['Expression']
    },
    { 
        name: 'Throw', 
        fields: [
            { name:'expression', type:'Expression', optional: true }
        ],
        imports: ['Expression']
    },
    { 
        name: 'Try', 
        fields: [
            { name:'tryBody', type:'BlockStatement' },
            { name:'exceptionVariableName', type:'Token', optional: true },
            { name:'catchBody', type:'BlockStatement', optional: true },
            { name:'finallyBody', type:'BlockStatement', optional: true }
        ],
        imports: ['Token', 'BlockStatement']
    },
    { 
        name: 'Var', 
        fields: [
            { name:'name', type:'Token' },
            { name:'initializerExpression', type:'Expression', optional:true }
        ],
        imports: ['Token', 'Expression']
    },
    { 
        name: 'While', 
        fields: [
            { name:'whileCondition', type:'Expression' },
            { name:'executeStatement', type:'Statement' }
        ],
        imports: ['Expression']
    },

];

var expression_types = [];

// Create statement files

var stmt_import_strings = {
    'Expression':  'import { Expression } from "../Expressions/Expression";\n',
    'Token': 'import { Token } from "../../Token";\n',
}

statement_types.forEach(function(st) {
    console.log(st.name);

    var imports = '';
    var fields = '';
    var ctorParams = '';
    var ctorAssigns = '';

    if (st.imports != null) {
        st.imports.forEach(function(imp) {
            if (stmt_import_strings[imp] != null) {
                imports += stmt_import_strings[imp];
            }
            else if (imp.endsWith('Statement')) {
                imports += `import {${imp}} from "./${imp}";\n`;
            }
            else if (imp.endsWith('Expression')) {
                imports += `import {${imp}} from "../Expressions/${imp}";\n`;
            } 
        });
    }

    st.fields.forEach(function(f) {
        fields += `    _${f.name}${f.optional ? '?':''}:${f.type};\n`;
        ctorParams += `${ctorParams.length > 0 ? ', ':''}${f.name}:${f.optional ? 'any':f.type}`
        ctorAssigns += `${ctorAssigns.length > 0 ? '\n':''}        this._${f.name} = ${f.name};`;
    })

    var classDefn = `import { Statement } from "./Statement";
${imports}
export class ${st.name}Statement implements Statement {

    getStatementType() : string {
        return "${st.name}";
    }

${fields}
    constructor(${ctorParams}) {
${ctorAssigns}
    }

    accept(visitor:any) {
        return visitor.visit${st.name}Statement(this);
    }
}`

//if (st.name == 'Function') {
    fs.writeFileSync(`./src/Internals/Ast/Statements/${st.name}Statement.ts`, classDefn);
//}
});
