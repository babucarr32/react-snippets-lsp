import * as fs from 'fs';

const logWriter = fs.createWriteStream('/tmp/lsp.log');

export const logger = {
  write: (data: unknown) => {
    if (typeof data === "object") {
      logWriter.write(JSON.stringify(data));
    } else {
      logWriter.write(data);
    }
    logWriter.write("\n");
  }
}
