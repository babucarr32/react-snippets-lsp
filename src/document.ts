import { DocumentUri } from "vscode-languageserver";

type DocumentBody = string;

export const document = new Map<DocumentUri, DocumentBody>();
