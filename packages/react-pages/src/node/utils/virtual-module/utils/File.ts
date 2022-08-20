import fs from 'fs-extra';
import * as path from 'path';

export class File {
  content: Promise<string> | null = null;

  constructor(readonly path: string, readonly base: string) { }

  get relative() {
    return path.posix.relative(this.base, this.path);
  }

  get extname() {
    return path.posix.extname(this.path).slice(1);
  }

  read() {
    return this.content || (this.content = fs.readFile(this.path, 'utf-8'));
  }
}
