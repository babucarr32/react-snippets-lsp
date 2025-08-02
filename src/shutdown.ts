
import { RequestMessage } from 'vscode-languageserver';
import { logger } from './log';
import { store } from './store';

const shutdown = (message: RequestMessage) => {
  logger.write('Received shutdown request');

  store.set('isShuttingDown', true);

  return null;
}

export {
  shutdown
}
