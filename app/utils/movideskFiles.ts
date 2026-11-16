/** Leitor local, sem upload, de exportações Movidesk (CSV Windows-1252 / UTF-8 / XLSX simples). */
export type MovideskRecord = Record<string,string>;
export const fieldKey = (input:unknown)=>String(input??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function csvRows(text:string){
  const first=(text.split(/\r?\n/,1)[0]||'');
  const delimiter=[';',',','\t'].sort((a,b)=>first.split(b).length-first.split(a).length)[0];
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===delimiter&&!quoted){row.push(cell);cell='';}
    else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted)throw Error('CSV com aspas não fechadas.');
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
  return rows;
}
function decodeCsv(bytes:Uint8Array){let s:string;try{s=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{s=new TextDecoder('windows-1252').decode(bytes)}return s.replace(/^\uFEFF/,'');}
function xmlDecode(s:string){return s.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi,m=>{const named:Record<string,string>={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"};if(named[m])return named[m];if(m.startsWith('&#x'))return String.fromCodePoint(parseInt(m.slice(3),16));if(m.startsWith('&#'))return String.fromCodePoint(parseInt(m.slice(2),10));return m;});}
const matchText=(s:string)=>xmlDecode((s.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)||[]).map(t=>(t.match(/>([\s\S]*?)<\/t>/)||[])[1]||'').join(''));
const excelDate=(serial:string)=>{const x=Number(serial);if(!Number.isFinite(x)||x<1000||x>250000)return serial;const d=new Date(Date.UTC(1899,11,30)+x*86400000);return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}${x%1?` ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`:''}`;};
function unzipDirectory(bytes:Uint8Array){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(view.getUint32(i,true)===0x06054b50){end=i;break}}
  if(end<0)throw Error('Arquivo Excel inválido (ZIP sem diretório).');
  const n=view.getUint16(end+10,true),start=view.getUint32(end+16,true);let offset=start;
  const entries=new Map<string,{offset:number,compressed:number,method:number,uncompressed:number}>();
  for(let i=0;i<n;i++){
    if(view.getUint32(offset,true)!==0x02014b50)throw Error('Estrutura XLSX inválida.');
    const compressed=view.getUint32(offset+20,true),uncompressed=view.getUint32(offset+24,true),method=view.getUint16(offset+10,true),nameLen=view.getUint16(offset+28,true),extra=view.getUint16(offset+30,true),comment=view.getUint16(offset+32,true),local=view.getUint32(offset+42,true);
    const name=new TextDecoder().decode(bytes.subarray(offset+46,offset+46+nameLen));entries.set(name,{offset:local,compressed,method,uncompressed});offset+=46+nameLen+extra+comment;
  }
  return {entries,view};
}
async function unzipEntry(bytes:Uint8Array,name:string,directory:ReturnType<typeof unzipDirectory>){
  const entry=directory.entries.get(name);if(!entry)return null;if(entry.uncompressed>20*1024*1024)throw Error('Planilha grande demais para leitura no navegador.');
  const {view}=directory;let start=entry.offset;if(view.getUint32(start,true)!==0x04034b50)throw Error('ZIP danificado.');start+=30+view.getUint16(start+26,true)+view.getUint16(start+28,true);
  const input=bytes.slice(start,start+entry.compressed);
  if(entry.method===0)return new TextDecoder().decode(input);
  if(entry.method!==8)throw Error('Compressão XLSX não suportada. Use CSV.');
  if(typeof DecompressionStream==='undefined')throw Error('Seu navegador não suporta XLSX nesta versão. Exporte em CSV.');
  const stream=new Blob([input]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
}
function xlsxRows(sheet:string,strings:string[],dateStyles:Set<number>){
  sheet=sheet.replace(/<(\/?)x:/g,'<$1');
  const rows:string[][]=[];
  const column=(ref:string)=>{let n=0;for(const char of ref.match(/^[A-Z]+/)?.[0]||'')n=n*26+char.charCodeAt(0)-64;return n-1};
  for(const match of sheet.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)){
    const cells:string[]=[];let counter=0;
    for(const c of match[1].matchAll(/<c\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/c>)/g)){
      const at=c[1],xml=c[2]||'';const col=column((at.match(/\br="([A-Z]+)\d+"/)||[])[1]||'');const index=col>=0?col:counter;counter=index+1;
      const type=(at.match(/\bt="([^"]+)"/)||[])[1]||'',style=Number((at.match(/\bs="(\d+)"/)||[])[1]||-1);
      const v=(xml.match(/<v>([\s\S]*?)<\/v>/)||[])[1]||'';
      let val=type==='inlineStr'?matchText(xml):type==='s'?strings[Number(v)]||'':xmlDecode(v);
      if((type===''||type==='n')&&dateStyles.has(style))val=excelDate(val);
      cells[index]=val;
    }
    if(cells.some(x=>String(x||'').trim()))rows.push(cells);
  }
  return rows;
}
async function readXlsx(bytes:Uint8Array){
  const dir=unzipDirectory(bytes),sheet=await unzipEntry(bytes,'xl/worksheets/sheet1.xml',dir);
  if(!sheet)throw Error('A planilha não contém a primeira aba. Exporte em CSV.');
  const sst=await unzipEntry(bytes,'xl/sharedStrings.xml',dir);const strings=sst?[...sst.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(m=>matchText(m[1])):[];
  const stylesXml=await unzipEntry(bytes,'xl/styles.xml',dir)||'';const formats=new Set<number>();
  for(const m of stylesXml.matchAll(/<numFmt\b([^>]*)\/>/g)){const id=Number((m[1].match(/numFmtId="(\d+)"/)||[])[1]);const code=(m[1].match(/formatCode="([^"]+)"/)||[])[1]||'';if(/[dmy]/i.test(code))formats.add(id)}
  for(const id of [14,15,16,17,18,19,20,21,22])formats.add(id);
  const dateStyles=new Set<number>(),cellStyles=(stylesXml.match(/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/)||[])[1]||'';
  let ix=0;for(const m of cellStyles.matchAll(/<xf\b([^>]*?)(?:\/|>)\s*/g)){if(formats.has(Number((m[1].match(/numFmtId="(\d+)"/)||[])[1]||0)))dateStyles.add(ix);ix++;}
  return xlsxRows(sheet,strings,dateStyles);
}
function bridgeRows(text:string):MovideskRecord[]{
 const payload=JSON.parse(text);if(!payload||payload.source!=='movidesk-kanban-extension'||!Array.isArray(payload.tickets))throw Error('O JSON não é uma exportação válida do RotaSmart Bridge.');
 return payload.tickets.map((t:Record<string,unknown>)=>Object.fromEntries(Object.entries({
  numero:t.numeroChamado||t.movideskId||'',status:t.statusOrigem||t.statusRotaSmart||'Novo',assunto:t.titulo||'',descricaodoticket:t.descricao||t.rawText||'',filialpostoponto:t.filial||'',cidade:t.cidade||'',endereco:t.endereco||'',bairro:t.bairro||'',responsavel:t.analistaResponsavel||'',urgencia:t.urgencia||'',servicocompleto:t.servico||'',abertoem:t.abertoEm||''
 }).map(([k,v])=>[k,String(v??'')]))).filter((r:MovideskRecord)=>r.numero);
}
export async function readMovideskFile(file:File):Promise<MovideskRecord[]>{
  if(file.size>10*1024*1024)throw Error('Arquivo acima de 10 MB.');
  if(file.name.toLowerCase().endsWith('.json'))return bridgeRows(await file.text());
  const rows=file.name.toLowerCase().endsWith('.xlsx')?await readXlsx(new Uint8Array(await file.arrayBuffer())):file.name.toLowerCase().endsWith('.csv')?csvRows(decodeCsv(new Uint8Array(await file.arrayBuffer()))):(()=>{throw Error('Formato inválido: use CSV ou XLSX.');})();
  if(rows.length<2)throw Error('Arquivo vazio ou sem dados.');
  const headers=rows[0].map(fieldKey);if(!headers.includes('numero')||!headers.includes('status'))throw Error('Não localizei as colunas obrigatórias Número e Status.');
  return rows.slice(1).map(row=>Object.fromEntries(headers.map((h,i)=>[h,['abertoem','datadaultimaacao','dataprogramadadamanutencao'].includes(h)&&/^\d{5}(?:\.\d+)?$/.test(String(row[i]??''))?excelDate(String(row[i])):String(row[i]??'').trim()]))).filter(r=>r.numero);
}
