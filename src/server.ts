import { createConnection, TextDocuments, ProposedFeatures, RequestMessage } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { logger } from './log';
import { initialize } from './methods/initialize';
import { completion } from './methods/textDocument/completion';
import { didChange } from './methods/textDocument/didChange';

type NotificationMethodFn = (message: RequestMessage) => ReturnType<typeof didChange>;
type RequestMethodFn = (message: RequestMessage) => ReturnType<typeof initialize> | ReturnType<typeof completion>;

type MethodLookup = Record<string, RequestMethodFn | NotificationMethodFn>;

const respond = (msgId: string, result: object | null) => {
  const message = JSON.stringify({ id: msgId, result });
  const messageLength = Buffer.byteLength(message, 'utf-8');
  const header = `Content-Length: ${messageLength}\r\n\r\n`;

  const response = header + message

  logger.write(response);
  process.stdout.write(response);
}

const methodLookup: MethodLookup = {
  initialize,
  "textDocument/completion": completion,
  "textDocument/didChange": didChange
}

let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk;

  while (true) {
    const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n/);
    if (!lengthMatch) break;

    const contentLength = parseInt(lengthMatch[1], 10);
    const messageStart = buffer.indexOf("\r\n\r\n") + 4;

    // Continue/break until the full message is in the buffer
    if (buffer.length < contentLength + messageStart) break;

    const messageEnd = contentLength + messageStart;
    const rawMessage = buffer.slice(messageStart, messageEnd);
    const message = JSON.parse(rawMessage);

    // logger.write({ id: message.id, method: message.method, params: message.params });

    const method = methodLookup[message.method];

    if (method) {
      const result = method(message);

      if (result !== undefined) {
        respond(message.id, result);
      }
    }

    // Remove the processed message from the buffer
    buffer = buffer.slice(messageStart, contentLength);
  }
});
