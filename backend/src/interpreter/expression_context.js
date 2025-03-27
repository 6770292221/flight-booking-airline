export class MappingInterpreter {
    constructor(expressions) {
      this.expressions = expressions;
    }
  
    interpret(context) {
      const result = {};
      for (const expr of this.expressions) {
        console.log(expr)
        expr.interpret(context, result);
      }
      return result;
    }
  }
  