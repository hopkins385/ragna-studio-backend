import { CSVParser } from '../parser/csv.parser';
import { XLSXParser } from '../parser/xlsx.parser';

export interface FileParser {
  loadData(filePath: string): Promise<any>;
}

export class FileParserFactory {
  type: string;
  filePath: string;
  parser: FileParser;

  constructor(type: string, filePath: string) {
    this.type = type;
    this.filePath = filePath;
    this.parser = this.getParser();
  }

  loadData() {
    return this.parser.loadData(this.filePath);
  }

  getParser() {
    switch (this.type) {
      case 'xlsx':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return new XLSXParser();
      case 'csv':
      case 'text/csv':
        return new CSVParser();
      default:
        throw new Error(`Unsupported file (mime)type: ${this.type}`);
    }
  }
}
