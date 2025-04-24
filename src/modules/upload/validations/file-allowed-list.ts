export const ACCEPTED_FILE_TYPES = Object.freeze({
  // pdf
  PDF: 'application/pdf',
  // doc
  DOC: 'application/msword',
  // docx
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // txt
  TXT: 'text/plain',
  // csv
  CSV: 'text/csv',
  // xls
  XLS: 'application/vnd.ms-excel',
  // xlsx
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // png
  PNG: 'image/png',
  // jpg
  JPG: 'image/jpg',
  // jpeg
  JPEG: 'image/jpeg',
});

export const ACCEPTED_FILE_TYPES_STRING = Object.values(ACCEPTED_FILE_TYPES).join('|');

export const ACCEPTED_FILE_TYPES_REGEXP = new RegExp(`^(${ACCEPTED_FILE_TYPES_STRING})$`, 'i');
