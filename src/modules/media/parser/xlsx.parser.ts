import { readFile } from 'fs/promises';
import xlsx from 'node-xlsx';

export class XLSXParser {
  async loadData(filePath: string) {
    const fileBuffer = await readFile(filePath);
    const workSheetsFromFile = xlsx.parse(fileBuffer, {
      skipHidden: true,
      defval: '',
      blankrows: false,
    });
    return workSheetsFromFile;
  }
}
