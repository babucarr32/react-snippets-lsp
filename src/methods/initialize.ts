import { InitializeResult, RequestMessage } from "vscode-languageserver";

export const initialize = (message: RequestMessage): InitializeResult => {
  return {
    capabilities: {
      completionProvider: {},
    }
  }
}
