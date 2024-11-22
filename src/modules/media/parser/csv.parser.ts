import { parse } from 'csv-parse/sync';
import { readFile } from 'fs/promises';

export class CSVParser {
  async loadData(filePath: string) {
    const fileBuffer = await readFile(filePath);

    const records = parse(fileBuffer, {
      bom: true,
      delimiter: ',',
      columns: false,
      skipEmptyLines: true,
    });

    return { data: records };
  }
}
