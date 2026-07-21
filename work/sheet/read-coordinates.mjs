import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = process.argv[2];
const output = process.argv[3];
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
console.log((await workbook.inspect({kind:"sheet",include:"id,name",maxChars:3000})).ndjson);
console.log((await workbook.inspect({kind:"table",sheetId:"Coordenadas",range:"A1:M12",include:"values,formulas",tableMaxRows:12,tableMaxCols:14,maxChars:12000})).ndjson);
const sheet = workbook.worksheets.getItem("Coordenadas");
const values = sheet.getUsedRange(true).values;
await fs.writeFile(output, JSON.stringify(values));
console.log(`ROWS=${values.length} COLS=${values[0]?.length||0}`);
