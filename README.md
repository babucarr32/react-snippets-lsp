# React/React Native Language Server Protocol (LSP)

A powerful LSP extension that provides intelligent code completion and dynamic snippet generation for React and React Native development.

## Features

### 🚀 Dynamic Component Generation
Create complex JSX structures using a simple syntax with automatic attribute and nesting support.

### 📱 React Native Integration
Built-in support for React Native components with proper imports and styling patterns.

### ⚡ Smart Completions
Context-aware completions for components, hooks, and common patterns.

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Install the LSP Server
```bash
npm install -g react-snippets-lsp
# or
yarn global add react-snippets-lsp
```

## Editor Setup

### Helix Editor

Add the following to your `~/.config/helix/languages.toml`:

```toml
[language-server.react-snippets-lsp]
command = "react-snippets-lsp"
args = ["--stdio"]

[[language]]
name = "jsx"
language-servers = ["typescript-language-server", "react-snippets-lsp"]

[[language]]
name = "tsx"
language-servers = ["typescript-language-server", "react-snippets-lsp"]

[[language]]
name = "javascript"
language-servers = ["typescript-language-server", "react-snippets-lsp"]

[[language]]
name = "typescript"
language-servers = ["typescript-language-server", "react-snippets-lsp"]
```

### Neovim (with nvim-lspconfig)

Add to your Neovim configuration:

```lua
-- Using nvim-lspconfig
local lspconfig = require('lspconfig')

-- Add custom LSP configuration
local configs = require('lspconfig.configs')

if not configs.react_rn_lsp then
  configs.react_rn_lsp = {
    default_config = {
      cmd = { 'react-snippets-lsp', '--stdio' },
      filetypes = { 'javascript', 'javascriptreact', 'typescript', 'typescriptreact' },
      root_dir = lspconfig.util.root_pattern('package.json', '.git'),
      settings = {},
    },
  }
end

lspconfig.react_rn_lsp.setup({
  capabilities = require('cmp_nvim_lsp').default_capabilities(),
})
```

### Vim (with vim-lsp)

Add to your `.vimrc`:

```vim
if executable('react-snippets-lsp')
  augroup LspReactRN
    autocmd!
    autocmd User lsp_setup call lsp#register_server({
      \ 'name': 'react-snippets-lsp',
      \ 'cmd': {server_info->['react-snippets-lsp', '--stdio']},
      \ 'allowlist': ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
      \ })
  augroup END
endif
```

### VS Code

Create a `.vscode/settings.json` in your project:

```json
{
  "languageServerExample.maxNumberOfProblems": 100,
  "languageServerExample.trace.server": "verbose"
}
```

### Emacs (with lsp-mode)

Add to your Emacs configuration:

```elisp
(use-package lsp-mode
  :hook ((js-mode . lsp)
         (js2-mode . lsp)
         (typescript-mode . lsp)
         (web-mode . lsp))
  :config
  (lsp-register-client
   (make-lsp-client :new-connection (lsp-stdio-connection "react-snippets-lsp")
                    :major-modes '(js-mode js2-mode typescript-mode web-mode)
                    :server-id 'react-snippets-lsp)))
```

## Usage

### Dynamic Component Syntax

Use `0` as a separator for attributes and `>` for nesting:

#### Basic Component
```
View
```
→ Expands to:
```jsx
<View>${0}</View>
```

#### Component with Attributes
```
View0style0onPress
```
→ Expands to:
```jsx
<View style={value} onPress={value}>

</View>
```

#### Function Attributes
```
TouchableOpacity0onPress(handlePress)0style
```
→ Expands to:
```jsx
<TouchableOpacity onPress={handlePress} style={value}>

</TouchableOpacity>
```

#### Nested Components
```
ScrollView0style>View0padding>Text0color(red)
```
→ Expands to:
```jsx
<ScrollView style={value}>
  <View padding={value}>
    <Text color={red}>

    </Text>
  </View>
</ScrollView>
```

### Built-in Snippets

#### React Native Components
- `rnf` - React Native Function Component
- `rnfe` - React Native Function Component (Exported)
- `rnfs` - React Native Function Component with StyleSheet
- `rnr` - React Native Return Statement

#### React Components
- `rf` - React Function Component
- `rfe` - React Function Component (Exported)  
- `rfc` - React Function Component (Named)
- `rr` - React Return Statement

#### React Hooks
- `useState` - useState hook with proper naming
- `useEffect` - useEffect hook with cleanup

#### Quick Components
- `View` - `<View></View>`
- `Text` - `<Text></Text>`
- `StyleSheet` - React Native StyleSheet reference

## Configuration

### Trigger Characters
The LSP is configured to trigger completions on:
- `0` (attribute separator)
- `>` (nesting separator)
- `(` and `)` (function parameters)

### File Types
Supports the following file extensions:
- `.js`, `.jsx`
- `.ts`, `.tsx`
- `.mjs`

## Examples

### Complex Navigation Structure
```
NavigationContainer>Stack.Navigator0initialRouteName(Home)>Stack.Screen0name(Home)0component(HomeScreen)>Stack.Screen0name(Details)0component(DetailsScreen)
```

### Form with Validation
```
Formik0initialValues(initialValues)0validationSchema(validationSchema)0onSubmit(handleSubmit)>View0style(styles.container)>TextInput0placeholder(Email)0onChangeText(handleChange)>TextInput0placeholder(Password)0secureTextEntry>Button0title(Submit)0onPress(handleSubmit)
```

### Styled Components
```
SafeAreaView0style(styles.container)>StatusBar0barStyle(dark-content)>ScrollView0contentInsetAdjustmentBehavior(automatic)>View0style(styles.body)>Text0style(styles.title)
```

## Troubleshooting

### LSP Not Starting
1. Verify the LSP is installed: `which react-snippets-lsp`
2. Check editor logs for connection errors
3. Ensure file types are properly configured

### Completions Not Showing
1. Verify trigger characters are configured
2. Check if dynamic tag regex is matching your input
3. Enable verbose logging to debug completion requests

### Indentation Issues
The LSP automatically handles proper JSX indentation. If you experience issues:
1. Check your editor's tab/space settings
2. Verify the LSP is using 2-space indentation
3. Report formatting issues with example inputs

## Contributing

### Development Setup
```bash
git clone https://github.com/babucarr32/react-snippets-lsp
cd react-snippets-lsp
npm install
npm run build
npm link
```
