import { logger } from '../log';
import { store } from '../store';

// Get the funcName and args in Greet(foo, bar, barfoo)
const regex = /^([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]+)\)$/;

const buildTag = (text: string, indentLevel: number = 0): string => {
  const trimmedText = text.trim();
  const children = trimmedText.split(">");

  let textStr: string[] = [];
  if (children.length > 1) {
    // Has children - use first part before '>'
    textStr = children[0].split("0");
  } else {
    // No children - split by '0'
    textStr = trimmedText.split("0");
  }

  const [tagName, ...attributes] = textStr;

  if (!tagName) return "";

  const currentIndent = "  ".repeat(indentLevel);
  const childIndent = "  ".repeat(indentLevel + 1);

  // If no attributes, return simple tag
  if (attributes.length === 0) {
    if (children.length > 1) {
      // Has children
      const childrenContent = children.slice(1).join(">");
      const childrenOutput = buildTag(childrenContent, indentLevel + 1);
      return `${currentIndent}<${tagName}>\n${childrenOutput}\n${currentIndent}</${tagName}>`;
    }
    return `${currentIndent}<${tagName}>\${0}</${tagName}>`;
  }

  // Build attributes string
  let attributesStr = "";
  let placeholderIndex = 1;

  attributes.forEach((attr, index) => {
    attr = attr.trim();
    if (!attr) return;

    const match = attr.match(regex);
    if (match) {
      // Function-like attribute: funcName(param1, param2) // Pass multiple values [a,b,c] // {a,b,c}
      const funcName = match[1];
      const params = match[2].split(',').map(p => p.trim());

      // Create snippet placeholders for parameters
      const snippetParams = params.map((param) => {
        return `\${${placeholderIndex++}:${param}}`;
      }).join(', ');

      attributesStr += `${funcName}={${snippetParams}}`;
    } else {
      // Simple attribute
      attributesStr += `${attr}={\${${placeholderIndex++}:value}}`;
    }

    // Add space between attributes (except for last one)
    if (index < attributes.length - 1) {
      attributesStr += " ";
    }
  });

  if (children.length > 1) {
    // Has children - recursively build them
    const childrenContent = children.slice(1).join(">");
    const childrenOutput = buildTag(childrenContent, indentLevel + 1);
    return `${currentIndent}<${tagName}${attributesStr ? ' ' + attributesStr : ''}>\n${childrenOutput}\n${currentIndent}</${tagName}>`;
  }

  // No children - add placeholder
  return `${currentIndent}<${tagName}${attributesStr ? ' ' + attributesStr : ''}>\n${childIndent}\${${placeholderIndex}}\n${currentIndent}</${tagName}>`;
};

const cleanup = () => {
  logger.write('Cleaning up resources...');

  // Remove all listeners
  process.stdin.removeAllListeners('data');
  process.stdin.removeAllListeners('end');
  process.stdin.removeAllListeners('error');

  // Close stdin if possible
  if (process.stdin.readable) {
    process.stdin.destroy();
  }
}

const handleTermination = (signal: string) => {
  logger.write(`Received ${signal}, shutting down...`);
  store.set('isShuttingDown', true);
  cleanup();
  process.exit(1);
}

export { buildTag, cleanup, handleTermination };
