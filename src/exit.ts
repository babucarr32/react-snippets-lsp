import { RequestMessage } from 'vscode-languageserver';
import { logger } from './log';
import { cleanup } from './utils';
import { store } from './store';

let hasReceivedShutdown = false;

const exit = (message: RequestMessage) => {
  logger.write('Received exit notification');
  store.set('isShuttingDown', true);

  // Cleanup resources
  cleanup();

  // Exit with proper code
  const exitCode = hasReceivedShutdown ? 0 : 1;
  logger.write(`Exiting with code ${exitCode}`);
  process.exit(exitCode);
}

export {
  exit
}
