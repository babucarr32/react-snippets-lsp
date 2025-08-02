#!/usr/bin/env node
'use strict';

import { createConnection, TextDocuments, ProposedFeatures, RequestMessage } from 'vscode-languageserver/node';
import { logger } from './log';
import { initialize } from './methods/initialize';
import { completion } from './methods/textDocument/completion';
import { didChange } from './methods/textDocument/didChange';
import { cleanup, handleTermination } from './utils';
import { exit } from './exit';
import { shutdown } from './shutdown';
import { store } from './store';

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

process.on('uncaughtException', (error) => {
  logger.write(`Uncaught exception: ${error.message}`);
  logger.write(error.stack || '');
  cleanup();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.write(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  cleanup();
  process.exit(1);
});

// Register signal handlers
process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));
process.on('SIGHUP', () => handleTermination('SIGHUP'));

const methodLookup: MethodLookup = {
  exit,
  shutdown,
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

process.stdin.on('end', () => {
  logger.write('stdin ended');

  const isShuttingDown = store.get('isShuttingDown');
  if (!isShuttingDown) {
    cleanup();
    process.exit(0);
  }
});

process.stdin.on('error', (error) => {
  logger.write(`stdin error: ${error.message}`);
  cleanup();
  process.exit(1);
});

// Optional: Handle process beforeExit
process.on('beforeExit', (code) => {
  logger.write(`Process about to exit with code: ${code}`);
});

logger.write('LSP Server started, waiting for initialize...');
