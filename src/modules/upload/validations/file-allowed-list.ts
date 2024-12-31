export const ACCEPTED_FILE_TYPES = [
  // pdf
  'application/pdf',
  // doc
  'application/msword',
  // docx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // txt
  'text/plain',
  // csv
  'text/csv',
  // xls
  'application/vnd.ms-excel',
  // xlsx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // png
  'image/png',
  // jpg
  'image/jpg',
  // jpeg
  'image/jpeg',
];

export const ACCEPTED_FILE_TYPES_REGEXP = new RegExp(
  ACCEPTED_FILE_TYPES.map((type) => type.replace('/', '\\/')).join('|'),
);
