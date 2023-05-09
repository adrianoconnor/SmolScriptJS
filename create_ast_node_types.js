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
            { name:'expression', type:'Expression' }
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

var expression_types = [
    { 
        name: 'Assign', 
        fields: [
            { name:'name', type:'Token' },
            { name:'value', type:'Expression' }
        ],
        imports: ['Token']
    },
    { 
        name: 'Binary', 
        fields: [
            { name:'left', type:'Expression' },
            { name:'op', type:'Token' },
            { name:'right', type:'Expression' }
        ],
        imports: ['Token']
    },
    { 
        name: 'Call', 
        fields: [
            { name:'callee', type:'Expression' },
            { name:'args', type:'Expression[]' },
            { name:'useObjectRef', type:'Boolean' }
        ]
    },
    { 
        name: 'Function', 
        fields: [
            { name:'parameters', type:'Token[]' },
            { name:'functionBody', type:'BlockStatement' }
        ],
        imports: ['Token', 'BlockStatement']
    },
    { 
        name: 'Get', 
        fields: [
            { name:'obj', type:'Expression' },
            { name:'name', type:'Token' }
        ],
        imports: ['Token']
    },
    { 
        name: 'Grouping', 
        fields: [
            { name:'expr', type:'Expression' }
        ]
    },
    { 
        name: 'IndexerGet', 
        fields: [
            { name:'obj', type:'Expression' },
            { name:'indexerExpr', type:'Expression' }
        ]
    },
    { 
        name: 'IndexerSet', 
        fields: [
            { name:'obj', type:'Expression' },
            { name:'indexerExpr', type:'Expression' },
            { name:'value', type:'Expression' }            
        ]
    },
    { 
        name: 'Literal', 
        fields: [
            { name:'value', type:'any' }        
        ]
    },
    { 
        name: 'Logical', 
        fields: [
            { name:'left', type:'Expression' },
            { name:'op', type:'Token' },
            { name:'right', type:'Expression' }
        ],
        imports: ['Token']
    },
    { 
        name: 'NewInstance', 
        fields: [
            { name:'className', type:'Token' },
            { name:'ctorArgs', type:'Expression[]' }
        ],
        imports: ['Token']
    },
    { 
        name: 'ObjectInitializer', 
        fields: [
            { name:'name', type:'Token' },
            { name:'value', type:'Expression' }
        ],
        imports: ['Token']
    },
    { 
        name: 'Set', 
        fields: [
            { name:'obj', type:'Expression' },
            { name:'name', type:'Token' },
            { name:'value', type:'Expression' }            
        ],
        imports: ['Token']
    },
    { 
        name: 'Ternary', 
        fields: [
            { name:'evaluationExpression', type:'Expression' },
            { name:'expresisonIfTrue', type:'Expression' },
            { name:'expresisonIfFalse', type:'Expression' }            
        ]
    },
    { 
        name: 'Unary', 
        fields: [
            { name:'op', type:'Token' },
            { name:'right', type:'Expression' }            
        ],
        imports: ['Token']
    },
    { 
        name: 'Variable', 
        fields: [
            { name:'name', type:'Token' },
            { name:'prepostfixOp', type:'TokenType', optional:true }            
        ],
        imports: ['Token', 'TokenType']
    }
];

// Create statement files

var stmt_import_strings = {
    'Expression':  'import { Expression } from "../Expressions/Expression";\n',
    'Token': 'import { Token } from "../../Token";\n',
}

var expr_import_strings = {
    'Statement':  'import { Expression } from "../Expressions/Expression";\n',
    'Token': 'import { Token } from "../../Token";\n',
    'TokenType': 'import { TokenType } from "../../TokenType";\n'
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
            else {
                throw new Error(`Can't handle importing ${imp}`);
            }

        });
    }

    st.fields.forEach(function(f) {
        fields += `    ${f.name}${f.optional ? '?':''}:${f.type};\n`;
        ctorParams += `${ctorParams.length > 0 ? ', ':''}${f.name}:${f.optional ? `${f.type}|undefined`:f.type}`
        ctorAssigns += `${ctorAssigns.length > 0 ? '\n':''}        this.${f.name} = ${f.name};`;
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

    fs.writeFileSync(`./src/Internals/Ast/Statements/${st.name}Statement.ts`, classDefn);

});


expression_types.forEach(function(ex) {
    console.log(ex.name);

    var imports = '';
    var fields = '';
    var ctorParams = '';
    var ctorAssigns = '';

    if (ex.imports != null) {
        ex.imports.forEach(function(imp) {
            if (expr_import_strings[imp] != null) {
                imports += expr_import_strings[imp];
            }
            else if (imp.endsWith('Expression')) {
                imports += `import {${imp}} from "./${imp}";\n`;
            }
            else if (imp.endsWith('Statement')) {
                imports += `import {${imp}} from "../Statements/${imp}";\n`;
            }
            else {
                throw new Error(`Can't handle importing ${imp}`);
            }
        });
    }

    ex.fields.forEach(function(f) {
        fields += `    ${f.name}${f.optional ? '?':''}:${f.type};\n`;
        ctorParams += `${ctorParams.length > 0 ? ', ':''}${f.name}:${f.optional ? `${f.type}|undefined`:f.type}`
        ctorAssigns += `${ctorAssigns.length > 0 ? '\n':''}        this.${f.name} = ${f.name};`;
    })

    var classDefn = `import { Expression } from "./Expression";
${imports}
export class ${ex.name}Expression implements Expression {

    getExpressionType() : string {
        return "${ex.name}";
    }

${fields}
    constructor(${ctorParams}) {
${ctorAssigns}
    }

    accept(visitor:any) {
        return visitor.visit${ex.name}Expression(this);
    }
}`

    fs.writeFileSync(`./src/Internals/Ast/Expressions/${ex.name}Expression.ts`, classDefn);

});
