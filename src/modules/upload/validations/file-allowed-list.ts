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

export const ACCEPTED_FILE_TYPES_REGEXP = new RegExp(
  'application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document|text/plain|text/csv|application/vnd.ms-excel|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|image/png|image/jpg|image/jpeg',
  'i',
);
