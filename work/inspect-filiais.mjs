import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source="C:/Users/inacio.carvalho/Downloads/filiais_ativas_agricopel_coordenadas_numericas.xlsx";
const input=await FileBlob.load(source);
const workbook=await SpreadsheetFile.importXlsx(input);
const overview=await workbook.inspect({kind:"sheet",include:"id,name",maxChars:3000});
console.log(overview.ndjson);
const table=await workbook.inspect({kind:"table",sheetId:"Coordenadas",range:"A1:L200",include:"values,formulas",tableMaxRows:200,tableMaxCols:12,maxChars:50000});
await fs.writeFile("work/filiais-inspect.ndjson",table.ndjson,"utf8");
const preview=await workbook.render({sheetName:"Coordenadas",range:"A1:L20",scale:1.2,format:"png"});
await fs.writeFile("work/filiais-preview.png",new Uint8Array(await preview.arrayBuffer()));
console.log("INSPECT_SAVED");
