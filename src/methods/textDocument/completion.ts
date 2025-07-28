import {
  CompletionItemKind,
  CompletionList,
  InsertTextFormat,
  RequestMessage,
  CompletionParams,
  CompletionItem,
} from 'vscode-languageserver-protocol';
import { document } from '../../document';
import { logger } from '../../log';
import { buildTag } from '../../utils';

// // More permissive regex that catches dynamic tag patterns using 0 as separator
const dynamicTagRegex = /^[a-zA-Z_][a-zA-Z0-9_]*(?:\([^()]*\))?(?:0[a-zA-Z_][a-zA-Z0-9_]*(?:\([^()]*\))?)*0?$/;

// More permissive regex that catches dynamic tag patterns
// const dynamicTagRegex = /^[a-zA-Z_][a-zA-Z0-9_]*(?:\([^()]*\))?(?::[a-zA-Z_][a-zA-Z0-9_]*(?:\([^()]*\))?)*:?$/;


export const completion = (message: RequestMessage): CompletionList | null => {
  const params = message.params as CompletionParams;

  const content = document.get(params.textDocument.uri);

  if (!content) {
    logger.write({ error: 'No content found for document', uri: params.textDocument.uri });
    return null;
  }

  const lines = content.split("\n");
  const currentLine = lines[params.position.line] || "";
  const lineUntilCursor = currentLine.slice(0, params.position.character);
  const currentWord = lineUntilCursor.replace(/.*\W(.*?)/, "$1");

  // Enhanced logging for debugging
  logger.write({
    position: params.position,
    currentLine: `"${currentLine}"`,
    lineUntilCursor: `"${lineUntilCursor}"`,
    currentWord: `"${currentWord}"`,
    trimmedLine: `"${currentLine.trim()}"`,
    lineLength: currentLine.length,
    cursorPosition: params.position.character
  });

  // Test the regex match
  const trimmedLine = currentLine.trim();
  const regexMatch = dynamicTagRegex.test(trimmedLine);

  logger.write({
    regexTest: regexMatch,
    trimmedLine: `"${trimmedLine}"`,
    regexPattern: dynamicTagRegex.toString()
  });

  // Additional conditions to check for dynamic tags
  const containsZero = trimmedLine.includes('0');
  const startsWithValidIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*/.test(trimmedLine);
  const isLikelyDynamicTag = startsWithValidIdentifier && (containsZero || regexMatch);

  logger.write({
    containsZero,
    startsWithValidIdentifier,
    isLikelyDynamicTag,
    conditions: {
      regexMatch,
      containsZero,
      startsWithValidIdentifier
    }
  });

  // Try multiple conditions to catch dynamic tags
  if (regexMatch || isLikelyDynamicTag) {
    logger.write({
      dynamicTagDetected: true,
      currentLine: trimmedLine,
      buildTagResult: buildTag(trimmedLine)
    });

    const dynamicItems: CompletionItem[] = [{
      label: 'dynamic snippet',
      documentation: `React Dynamic Component\nInput: "${trimmedLine}"`,
      // insertText: buildTag(trimmedLine),
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      // Higher priority to show first
      sortText: '0000',
      filterText: trimmedLine,
      // Replace the whole line with the built tag
      // + 1 to catter for (<when cursor is herer>)
      textEdit: {
        range: {
          start: { line: params.position.line, character: 0 },
          end: { line: params.position.line, character: params.position.character + 1 },
        },
        newText: buildTag(trimmedLine)
      }
    }];

    // Also include regular completions as fallback
    const regularItems = getRegularCompletions();

    return {
      isIncomplete: false,
      items: [...dynamicItems, ...regularItems],
    };
  }

  // Fallback to regular completions
  logger.write({
    dynamicTagDetected: false,
    fallingBackToRegular: true
  });

  return {
    isIncomplete: false,
    items: getRegularCompletions(),
  };
};

function getRegularCompletions() {
  return [
    // === React Native Snippets ===
    {
      label: 'rnf',
      documentation: 'React Native Function Component\\nImports: View, Text from react-native',
      insertText: `import { View, Text } from 'react-native';\n\nconst \${1:ComponentName} = () => {\n  return (\n    <View>\n      <Text>\${2:Hello World}</Text>\n    </View>\n  );\n};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1000',
    },
    {
      label: 'rnfe',
      documentation: 'React Native Function Component (Exported)\\nImports: View, Text from react-native',
      insertText: `import { View, Text } from 'react-native';\n\nexport const \${1:ComponentName} = () => {\n  return (\n    <View>\n      <Text>\${2:Hello World}</Text>\n    </View>\n  );\n};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1001',
    },
    {
      label: 'rnfs',
      documentation: 'React Native Function Component with StyleSheet',
      insertText: `import { View, Text, StyleSheet } from 'react-native';\n\nconst \${1:ComponentName} = () => {\n  return (\n    <View style={styles.container}>\n      <Text>\${2:Hello World}</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n  },\n});`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1002',
    },

    // === React Snippets ===
    {
      label: 'rf',
      documentation: 'React Function Component (default)',
      insertText: `const \${1:ComponentName} = () => {\n  return (\n    <div>\n      \${2:Hello World}\n    </div>\n  );\n};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1003',
    },
    {
      label: 'rfe',
      documentation: 'React Function Component (Exported)',
      insertText: `export const \${1:ComponentName} = () => {\n  return (\n    <div>\n      \${2:Hello World}\n    </div>\n  );\n};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1004',
    },
    {
      label: 'rfc',
      documentation: 'React Function Component (Named)',
      insertText: `function \${1:ComponentName}() {\n  return (\n    <div>\n      \${2:Hello World}\n    </div>\n  );\n}\n\nexport default \${1:ComponentName};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1005',
    },

    // === Useful Hooks ===
    {
      label: 'useState',
      documentation: 'React useState hook',
      insertText: `const [\${1:state}, set\${1/(.*)/\${1:/capitalize}/}] = useState(\${2:null});`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Function,
      sortText: '1006',
    },
    {
      label: 'useEffect',
      documentation: 'React useEffect hook',
      insertText: `useEffect(() => {\n  \${1:// effect}\n  return () => {\n    \${2:// cleanup}\n  };\n}, [\${3:dependencies}]);`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Function,
      sortText: '1007',
    },

    // === React Native Components (Basic Autocomplete) ===
    {
      label: 'View',
      documentation: 'React Native View component\\nImport: { View } from "react-native"',
      insertText: '<View></View>',
      kind: CompletionItemKind.Class,
      sortText: '1008',
    },
    {
      label: 'Text',
      documentation: 'React Native Text component\\nImport: { Text } from "react-native"',
      insertText: '<Text></Text>',
      kind: CompletionItemKind.Class,
      sortText: '1009',
    },
    {
      label: 'StyleSheet',
      documentation: 'React Native StyleSheet\\nImport: { StyleSheet } from "react-native"',
      insertText: 'StyleSheet',
      kind: CompletionItemKind.Class,
      sortText: '1010',
    },


    // === React Native Return ===
    {
      label: 'rnr',
      documentation: 'React Native Return Statement',
      insertText: `return (\n  <View>\n    \${1:content}\n  </View>\n);`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '0010',
    },
    // === React Return ===
    {
      label: 'rr',
      documentation: 'React Return Statement',
      insertText: `return (\n  <div>\n    \${1:content}\n  </div>\n);`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '00011',
    },

    // === React Hooks ===
    {
      label: 'useCallback',
      documentation: 'React useCallback hook',
      insertText: `const \${1:callback} = useCallback(() => {\n  \${2}\n}, [\${3}]);`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Function,
      sortText: '1011',
    },
    {
      label: 'useMemo',
      documentation: 'React useMemo hook',
      insertText: `const \${1:memorizedValue} = useMemo(() => \${2:value}, [\${3:dependencies}]);`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Function,
      sortText: '1012',
    },
    {
      label: 'useCustomHook',
      documentation: 'Custom React hook boilerplate',
      insertText: `const use\${1:CustomHook} = () => {\n  const [\${2:state}, set\${2/(.*)/\${1:/capitalize}/}] = useState(\${3:null});\n  \n  return {\n    \${2},\n  };\n};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1013',
    },
    {
      label: 'useCustomHookExport',
      documentation: 'Custom React hook boilerplate (exported)',
      insertText: `export const use\${1:CustomHook} = () => {\n  const [\${2:state}, set\${2/(.*)/\${1:/capitalize}/}] = useState(\${3:null});\n\n  return {\n    \${2},\n  };\n};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1013',
    },

    // === React Native Navigation ===
    {
      label: 'rnnav',
      documentation: 'React Navigation screen setup',
      insertText: `import { createNativeStackNavigator } from '@react-navigation/native-stack';\n\nconst Stack = createNativeStackNavigator();\n\nconst \${1:AppNavigator} = () => {\n  return (\n    <Stack.Navigator>\n      <Stack.Screen name="\${2:Home}" component={\${3:HomeScreen}} />\n    </Stack.Navigator>\n  );\n};`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1014',
    },

    // === React Native Style ===
    {
      label: 'styleObj',
      documentation: 'Inline Style object',
      insertText: `{\n  padding: \${1:10},\n  backgroundColor: '\${2:#fff}',\n  borderRadius: \${3:8},\n}`,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Snippet,
      sortText: '1015',
    },
  ];
}
