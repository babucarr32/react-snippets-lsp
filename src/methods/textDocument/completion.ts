import {
  CompletionItemKind,
  CompletionList,
  InsertTextFormat,
  RequestMessage,
  CompletionParams,
} from 'vscode-languageserver-protocol';

export const completion = (message: RequestMessage): CompletionList => {
  const params = message.params as CompletionParams;
  return {
    isIncomplete: false,
    items: [
      // === React Native Snippets ===
      {
        label: 'rnf',
        documentation: 'React Native Function Component\\nImports: View, Text from react-native',
        insertText: `import { View, Text } from 'react-native';\n\nconst \${1:ComponentName} = () => {\n  return (\n    <View>\n      <Text>\${2:Hello World}</Text>\n    </View>\n  );\n};`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Snippet,
      },
      {
        label: 'rnfe',
        documentation: 'React Native Function Component (Exported)\\nImports: View, Text from react-native',
        insertText: `import { View, Text } from 'react-native';\n\nexport const \${1:ComponentName} = () => {\n  return (\n    <View>\n      <Text>\${2:Hello World}</Text>\n    </View>\n  );\n};`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Snippet,
      },
      {
        label: 'rnfs',
        documentation: 'React Native Function Component with StyleSheet',
        insertText: `import { View, Text, StyleSheet } from 'react-native';\n\nconst \${1:ComponentName} = () => {\n  return (\n    <View style={styles.container}>\n      <Text>\${2:Hello World}</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n  },\n});`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Snippet,
      },

      // === React Snippets ===
      {
        label: 'rf',
        documentation: 'React Function Component (default)',
        insertText: `const \${1:ComponentName} = () => {\n  return (\n    <div>\n      \${2:Hello World}\n    </div>\n  );\n};`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Snippet,
      },
      {
        label: 'rfe',
        documentation: 'React Function Component (Exported)',
        insertText: `export const \${1:ComponentName} = () => {\n  return (\n    <div>\n      \${2:Hello World}\n    </div>\n  );\n};`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Snippet,
      },
      {
        label: 'rfc',
        documentation: 'React Function Component (Named)',
        insertText: `function \${1:ComponentName}() {\n  return (\n    <div>\n      \${2:Hello World}\n    </div>\n  );\n}\n\nexport default \${1:ComponentName};`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Snippet,
      },

      // === Useful Hooks ===
      {
        label: 'useState',
        documentation: 'React useState hook',
        insertText: `const [\${1:state}, set\${1/(.*)/\${1:/capitalize}/}] = useState(\${2:null});`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Function,
      },
      {
        label: 'useEffect',
        documentation: 'React useEffect hook',
        insertText: `useEffect(() => {\n  \${1:// effect}\n  return () => {\n    \${2:// cleanup}\n  };\n}, [\${3:dependencies}]);`,
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Function,
      },

      // === React Native Components (Basic Autocomplete) ===
      {
        label: 'View',
        documentation: 'React Native View component\\nImport: { View } from "react-native"',
        insertText: 'View',
        kind: CompletionItemKind.Class,
      },
      {
        label: 'Text',
        documentation: 'React Native Text component\\nImport: { Text } from "react-native"',
        insertText: 'Text',
        kind: CompletionItemKind.Class,
      },
      {
        label: 'StyleSheet',
        documentation: 'React Native StyleSheet\\nImport: { StyleSheet } from "react-native"',
        insertText: 'StyleSheet',
        kind: CompletionItemKind.Class,
      },
    ],
  };
};
