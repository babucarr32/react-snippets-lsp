import * as fs from 'fs';

const logWritter = fs.createWriteStream('/tmp/lsp.log');

export const logger = {
  write: (data: unknown) => {
    if (typeof data === "object") {
      logWritter.write(JSON.stringify(data));
    } else {
      logWritter.write(data);
    }
    logWritter.write("\n");
  }
}
