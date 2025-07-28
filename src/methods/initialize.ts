import { InitializeResult, RequestMessage } from "vscode-languageserver";

export const initialize = (message: RequestMessage): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: 1,
      completionProvider: {}
    }
  }
}
