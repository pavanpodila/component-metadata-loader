const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

module.exports = function(source) {
  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: [
      'jsx',
      [
        'decorators',
        {
          decoratorsBeforeExport: false,
        },
      ],
    ],
  });

  traverse(ast, {
    ClassDeclaration: ({ node }) => {
      const name = node.id;

      const result = getMetadata(node.decorators || []);
      if (!result) return;

      const { decorator, args } = result;
      node.decorators = node.decorators.filter(x => x !== decorator);
      if (node.decorators.length === 0) {
        delete node.decorators;
      }
    },
  });

  return source;
};

function getMetadata(decorators) {
  let d = decorators.filter(
    d =>
      d.expression.type === 'CallExpression' &&
      d.expression.callee.name === 'Metadata',
  );
  d = d[0];

  if (!d) return null;

  const options = d.expression.arguments && d.expression.arguments[0];
  if (!options) return null;

  return { decorator: d, args: extractValue(options) };
}

function extractValue(node) {
  if (node.type.endsWith('Literal')) {
    return node.value;
  }

  if (node.type === 'ObjectExpression') {
    return node.properties.reduce((obj, prop) => {
      obj[prop.key.name] = extractValue(prop.value);
      return obj;
    }, {});
  }

  return null;
}
