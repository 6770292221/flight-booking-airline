export class Expression {
  interpret(context, result) {
    throw new Error("interpret() must be implemented");
  }
  deepSet(obj, path, value) {
    const keys = path.split(".");
    let current = obj;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    });
  }
  sourcePathGet(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }
}

export class DirectFieldExpression extends Expression {
  constructor(targetField, sourcePath) {
    super();
    this.targetField = targetField;
    this.sourcePath = sourcePath;
  }

  interpret(context, result) {
    const value = this.sourcePathGet(context, this.sourcePath);
    this.deepSet(result, this.targetField, value);
  }
}

export class LookupExpression extends Expression {
  constructor(targetField, collectionName, matchKeyPath, returnField) {
    super();
    this.targetField = targetField;
    this.collectionName = collectionName;
    this.matchKeyPath = matchKeyPath;
    this.returnField = returnField;
  }

  interpret(context, result) {
    const key = this.sourcePathGet(context, this.matchKeyPath);
    const collection = context[this.collectionName];
    const found = collection.find(
      (item) =>
        item.iataCode === key || item.aircraftCode === key || item.code === key
    );
    if (found) {
      this.deepSet(result, this.targetField, found[this.returnField]);
    }
  }
}
