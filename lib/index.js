const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

const path = require('path');
const fs = require('fs');

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

  const loader = this;

  traverse(ast, {
    ClassDeclaration: ({ node }) => {
      const name = node.id.name;

      const result = getMetadata(node.decorators || []);
      if (!result) return;

      const { decorator, args } = result;
      node.decorators = node.decorators.filter(x => x !== decorator);
      if (node.decorators.length === 0) {
        delete node.decorators;
      }

      const options = {
        name,
        ...args,
        env: {
          context: loader.context,
        },
      };

      if (!validateOptions(options, name, loader)) return;

      loader.emitFile(
        `${options.name}.component.json`,
        JSON.stringify(options, null, 4),
      );
    },
  });

  const { code } = generator(ast);
  return code;
};

function validateOptions(options, name, loader) {
  if (!options.name) {
    loader.emitError(`name must be specified for ${name}`);

    return false;
  }

  if (!options.thumbnail) {
    loader.emitError(`thumbnail must be specified for ${name}`);

    return false;
  }

  const filePath = path.resolve(options.env.context, options.thumbnail);
  if (!fs.existsSync(filePath)) {
    loader.emitError(
      `Missing thumbnail (${filePath}) for ${name}, does not exist.`,
    );

    return false;
  }

  return true;
}

function getMetadata(decorators) {
  let d = decorators.filter(d => {
    const {
      expression: { type, callee },
    } = d;

    return type === 'CallExpression' && callee.name === 'Metadata';
  })[0]; // only pick the first one that matches

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

  if (node.type === 'ArrayExpression') {
    return node.elements.map(elt => extractValue(elt));
  }

  return null;
}
