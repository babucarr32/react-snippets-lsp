import { DidChangeTextDocumentParams, RequestMessage } from "vscode-languageserver"
import { document } from "../../document";

export const didChange = (message: RequestMessage): void => {
  const params = message.params as DidChangeTextDocumentParams;
  document.set(params.textDocument.uri, params.contentChanges[0].text)
}
