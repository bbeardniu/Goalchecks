(() => {
  'use strict';

  const columns = Object.freeze(['Record ID','Date','Student','Grade','Goal ID','Goal Version','Subtest','Administrator','Mode','Level','Form','Score Type','Score','Correct','Attempts','Errors','First Minute Correct','First Minute Attempts','First Minute Errors','First Minute Accuracy','Total Seconds','First Minute Seconds','Supports','Notes','Assessment','Response Details']);
  const numericColumns = new Set(['Score','Correct','Attempts','Errors','First Minute Correct','First Minute Attempts','First Minute Errors','First Minute Accuracy','Total Seconds','First Minute Seconds']);
  const attached = new WeakMap();
  const modes = {baseline:'Baseline',weekly:'Weekly Check',practice:'Practice'};

  function text(value) { return value == null ? '' : String(value); }
  function number(value) { return value == null || value === '' || typeof value === 'string' && !value.trim() || typeof value === 'boolean' || !Number.isFinite(Number(value)) ? '' : Number(value); }
  function first(...values) { return values.find(value => value != null && value !== '') ?? ''; }
  function validIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text(value))) return false;
    const [year,month,day] = value.split('-').map(Number);
    const date = new Date(0);date.setFullYear(year,month-1,day);date.setHours(12,0,0,0);
    return date.getFullYear()===year && date.getMonth()===month-1 && date.getDate()===day;
  }
  function localDate(value = new Date()) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return validIsoDate(value) ? value : '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function excelSerialDate(value) {
    if (!validIsoDate(value)) return '';
    const [year,month,day] = value.split('-').map(Number);
    const date = new Date(0);date.setUTCFullYear(year,month-1,day);date.setUTCHours(0,0,0,0);
    return Math.round((date.getTime()-Date.UTC(1899,11,30))/86400000);
  }
  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `gc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}-${Math.random().toString(36).slice(2,8)}`;
  }
  function slug(value) { return text(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100) || 'goal'; }
  function fraction(value) {
    const result = number(value);
    if (result === '') return '';
    return result > 1 && result <= 100 ? result / 100 : result;
  }
  function toRecord(context = {}, metadata = {}) {
    const fm = context.firstMinute || {};
    const attempts = number(context.attempts);
    const correct = number(context.correct);
    const scoreType = text(first(context.scoreType, 'Accuracy'));
    const subtest = text(first(metadata.subtest, metadata.subtestLabel, context.subtest, context.title, context.assessment)).trim();
    let score = number(context.score);
    if (/^pending$/i.test(scoreType)) score = '';
    else if (/^(accuracy|rubric)$/i.test(scoreType)) score = attempts === 0 ? '' : score === '' ? (attempts > 0 && correct !== '' ? correct / attempts : '') : fraction(score);
    const fmAttempts = number(fm.attempts), fmCorrect = number(fm.correct);
    const fmAccuracy = fm.accuracy == null ? (fmAttempts > 0 && fmCorrect !== '' ? fmCorrect / fmAttempts : '') : fraction(fm.accuracy);
    let details = '';
    if (context.responses != null) {
      try { details = JSON.stringify(context.responses); } catch { details = ''; }
    }
    const record = {
      'Record ID':text(first(metadata.recordId, context.recordId, newId())),
      'Date':localDate(first(metadata.date, context.date, context.completedAt, new Date())),
      'Student':text(first(metadata.student, metadata.studentCode, context.student, context.studentCode)).trim(),
      'Grade':text(first(metadata.grade, context.grade)).trim(),
      'Goal ID':text(first(metadata.goalId, metadata.goalID, context.goalId, slug(subtest))).trim(),
      'Goal Version':text(first(metadata.goalVersion, context.goalVersion, 'Current')).trim(),
      'Subtest':subtest,
      'Administrator':text(first(metadata.administrator, context.administrator)).trim(),
      'Mode':modes[context.mode] || text(context.mode),
      'Level':text(first(context.level, metadata.level)),
      'Form':text(first(context.formId, context.form)),
      'Score Type':scoreType,
      'Score':score,
      'Correct':/^pending$/i.test(scoreType) ? '' : correct,
      'Attempts':attempts,
      'Errors':/^pending$/i.test(scoreType) ? '' : number(context.errors),
      'First Minute Correct':fmCorrect,
      'First Minute Attempts':fmAttempts,
      'First Minute Errors':number(fm.errors),
      'First Minute Accuracy':fmAccuracy,
      'Total Seconds':number(context.totalSeconds),
      'First Minute Seconds':number(fm.seconds),
      'Supports':text(first(metadata.supports, context.supports)),
      'Notes':text(first(metadata.notes, context.notes)),
      'Assessment':text(first(context.assessment, context.title)),
      'Response Details':details
    };
    return Object.fromEntries(columns.map(column => [column,record[column]]));
  }

  // The leading apostrophe keeps teacher-entered text from being interpreted as an Excel formula.
  // Actual numeric values, including negative numbers, remain numbers.
  function safeCell(value, column) {
    if (value == null) return '';
    if (numericColumns.has(column) && typeof value === 'string' && !value.trim()) return '';
    if (numericColumns.has(column) && value !== '' && typeof value !== 'boolean' && Number.isFinite(Number(value))) return String(Number(value));
    let valueText = text(value).replace(/\u0000/g,'');
    if (/^[\s\u0001-\u001f\u007f]*[=+@-]/.test(valueText)) valueText = "'" + valueText;
    return valueText;
  }
  function quoteCell(value, delimiter) {
    return value.includes(delimiter) || /["\r\n]/.test(value) ? '"' + value.replace(/"/g,'""') + '"' : value;
  }
  function serialize(records, delimiter, includeHeader) {
    const items = Array.isArray(records) ? records : [records];
    const rows = items.map(record => columns.map(column => quoteCell(safeCell(record[column],column),delimiter)).join(delimiter));
    if (includeHeader) rows.unshift(columns.join(delimiter));
    return rows.join('\r\n');
  }
  function csv(records, includeHeader = true) { return serialize(records, ',', includeHeader); }
  function tsv(records, includeHeader = false) {
    const items = (Array.isArray(records) ? records : [records]).map(record=>({...record,Date:excelSerialDate(record.Date)}));
    return serialize(items, '\t', includeHeader);
  }

  function parseCells(input) {
    const inputText = text(input).replace(/^\uFEFF/,'');
    const rows = []; let row = [], cell = '', quoted = false, closed = false;
    function finishCell() { row.push(cell); cell=''; closed=false; }
    function finishRow() { finishCell(); if(row.some(value => value !== '')) rows.push(row); row=[]; }
    for(let index=0;index<inputText.length;index++) {
      const character=inputText[index];
      if(quoted) {
        if(character==='"') { if(inputText[index+1]==='"') {cell+='"';index++;} else {quoted=false;closed=true;} }
        else cell+=character;
      } else if(character==='"') {
        if(cell!=='' || closed) throw new Error('Unexpected quote in CSV field.');
        quoted=true;
      } else if(character===',') finishCell();
      else if(character==='\r' || character==='\n') {finishRow();if(character==='\r'&&inputText[index+1]==='\n')index++;}
      else { if(closed) {if(character===' '||character==='\t')continue;throw new Error('Unexpected text after a quoted CSV field.');} cell+=character; }
    }
    if(quoted) throw new Error('CSV contains an unclosed quoted field.');
    if(cell!=='' || row.length || closed) finishRow();
    return rows;
  }
  function parseCsv(input) {
    const rows = parseCells(input);
    if(!rows.length) throw new Error('The file is empty.');
    const headers = rows.shift();
    if(headers.length!==columns.length || headers.some((header,index)=>header!==columns[index])) throw new Error('This file does not have the Beard’s Classroom score-export columns in the expected order.');
    const records=rows.map((values,index)=>{
      if(values.length!==columns.length) throw new Error(`Row ${index+2} has ${values.length} columns; ${columns.length} are required.`);
      const record={};columns.forEach((column,columnIndex)=>{
        const value=values[columnIndex];
        if(numericColumns.has(column)&&value.trim()!=='') {
          if(!Number.isFinite(Number(value))) throw new Error(`Row ${index+2} has a nonnumeric ${column} value.`);
          record[column]=Number(value);
        } else record[column]=numericColumns.has(column)?'':value;
      });
      if(!record['Record ID'].trim()) throw new Error(`Row ${index+2} is missing its Record ID.`);
      if(!validIsoDate(record.Date)) throw new Error(`Row ${index+2} has an invalid Date; use YYYY-MM-DD.`);
      return record;
    });
    return {headers,records,rows:records};
  }
  function mergeCsv(files) {
    const unique=new Map(), conflictMap=new Map(), errors=[];let duplicateCount=0;
    for(let index=0;index<files.length;index++) {
      const file=typeof files[index]==='string'?{name:`File ${index+1}`,text:files[index]}:files[index];
      try {
        for(const record of parseCsv(file.text).records) {
          const id=record['Record ID'];
          const signature=JSON.stringify(columns.map(column=>record[column]));
          if(conflictMap.has(id)) {conflictMap.get(id).push({source:file.name,record});continue;}
          if(!unique.has(id)) {unique.set(id,{signature,source:file.name,record});continue;}
          const previous=unique.get(id);
          if(previous.signature===signature) duplicateCount++;
          else {conflictMap.set(id,[{source:previous.source,record:previous.record},{source:file.name,record}]);unique.delete(id);}
        }
      } catch(error) {errors.push({source:file.name,message:error.message});}
    }
    return {records:[...unique.values()].map(item=>item.record),duplicateCount,conflicts:[...conflictMap].map(([id,versions])=>({id,versions})),errors};
  }

  function downloadFile(filename, contents, mime='text/csv;charset=utf-8', doc=document) {
    const view=doc.defaultView||window,urls=view.URL||URL,BlobClass=view.Blob||Blob;
    const url=urls.createObjectURL(new BlobClass([contents],{type:mime}));
    const anchor=doc.createElement('a');anchor.href=url;anchor.download=filename;anchor.style.display='none';doc.body.appendChild(anchor);anchor.click();anchor.remove();
    view.setTimeout(()=>urls.revokeObjectURL(url),1000);
  }
  async function copyText(value, doc=document) {
    const view=doc.defaultView||window;
    if(view.navigator && view.navigator.clipboard && view.isSecureContext!==false) {
      try {await view.navigator.clipboard.writeText(value);return true;} catch {}
    }
    const input=doc.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.cssText='position:fixed;left:-10000px;top:0';doc.body.appendChild(input);input.select();
    let copied=false;try{copied=Boolean(doc.execCommand && doc.execCommand('copy'));}catch{}input.remove();return copied;
  }
  function addStyles(doc=document) {
    if(doc.getElementById('beard-score-export-style'))return;
    const style=doc.createElement('style');style.id='beard-score-export-style';
    style.textContent=`.beard-score-export{margin-top:1.1rem;padding:1rem;border:2px solid #cfe1d8;border-radius:12px;background:#f4faf5;color:#26394b;text-align:left;font-family:"Avenir Next",Avenir,"Segoe UI",sans-serif}.beard-score-export h3{margin:0 0 .35rem!important;font-size:1.12rem!important;color:#2f5b57!important}.beard-score-export p{margin:.35rem 0 .8rem!important;font-size:.88rem!important;line-height:1.45!important}.beard-export-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}.beard-export-field{display:flex;min-width:0;flex-direction:column;gap:.2rem;color:#365f50;font-size:.82rem;font-weight:800}.beard-export-field input,.beard-export-field textarea{box-sizing:border-box!important;width:100%!important;min-width:0!important;margin:0!important;padding:.55rem .6rem!important;font:400 .95rem/1.35 "Segoe UI",sans-serif!important;border:1px solid #adc8b8!important;border-radius:7px!important;background:#fff!important;color:#26394b!important}.beard-export-field textarea{resize:vertical;min-height:70px}.beard-export-field.is-wide{grid-column:1/-1}.beard-export-actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.8rem}.beard-export-actions button{min-height:44px;cursor:pointer;margin:0!important;padding:.65rem .85rem!important;border:0!important;border-radius:8px!important;background:#2f6c58!important;color:#fff!important;font:800 .92rem/1.2 "Segoe UI",sans-serif!important}.beard-export-status{margin:.65rem 0 0!important;font-weight:800!important;color:#2f5b57!important}.beard-export-status.is-error{color:#ac3c3c!important}.beard-export-fallback{box-sizing:border-box;width:100%;min-height:100px;margin-top:.6rem;font:400 .83rem/1.4 monospace}.beard-score-export details{margin-top:.7rem}.beard-score-export details>summary{cursor:pointer;color:#365f50;font-size:.9rem;font-weight:800}.beard-score-export details .beard-export-fields{margin-top:.65rem}@media(max-width:560px){.beard-export-fields{grid-template-columns:1fr}.beard-export-actions{display:grid;grid-template-columns:1fr}.beard-export-actions button{width:100%}}@media print{.beard-score-export{display:none!important}}`;
    doc.head.appendChild(style);
  }
  function attach(report, context={}) {
    if(!report)return null;
    if(attached.has(report)) {const controller=attached.get(report);controller.refresh(context);if(controller.element.parentNode!==report)report.appendChild(controller.element);return controller;}
    const doc=report.ownerDocument||document;
    addStyles(doc);
    const state={...context,recordId:context.recordId||newId(),date:localDate(first(context.date,context.completedAt,new Date()))};
    const panel=doc.createElement('section');panel.className='beard-score-export';panel.setAttribute('aria-label','Export assessment score for Excel');
    const title=doc.createElement('h3');title.textContent='Save to your shared score log';
    const hint=doc.createElement('p');hint.textContent='Use the same student code and subtest label as your workbook. Copy the row into the next empty row of Score Log, or download a CSV. Details stay in this page until you copy or download them; this tool does not upload or remember them after the page closes.';
    const basic=doc.createElement('div');basic.className='beard-export-fields';
    const advanced=doc.createElement('details');const advancedLabel=doc.createElement('summary');advancedLabel.textContent='Goal, support, and collection details';advanced.appendChild(advancedLabel);
    const more=doc.createElement('div');more.className='beard-export-fields';advanced.appendChild(more);
    const fields={};
    function field(key,label,value,parent,type='text',required=false,wide=false) {
      const wrapper=doc.createElement('label');wrapper.className='beard-export-field'+(wide?' is-wide':'');
      const caption=doc.createElement('span');caption.textContent=label+(required?' *':'');
      const input=doc.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.value=text(value);input.autocomplete='off';input.required=required;input.setAttribute('aria-label',label);if(key==='student')input.maxLength=120;
      wrapper.append(caption,input);parent.appendChild(wrapper);fields[key]=input;return input;
    }
    field('student','Student code',first(context.student,context.studentCode),basic,'text',true);
    field('subtest','Subtest / goal label',first(context.subtest,context.title,context.assessment),basic,'text',true);
    field('administrator','Administrator',context.administrator,basic);
    field('grade','Grade',context.grade,basic);
    field('date','Date',state.date,more,'date');
    field('goalId','Goal code (optional)',context.goalId,more);
    field('goalVersion','Goal revision',first(context.goalVersion,'Current'),more);
    field('supports','Supports / read-aloud / prompting',context.supports,more,'textarea',false,true);
    field('notes','Notes',context.notes,more,'textarea',false,true);
    const actions=doc.createElement('div');actions.className='beard-export-actions';
    const copyButton=doc.createElement('button');copyButton.type='button';copyButton.textContent='Copy Excel Row';
    const csvButton=doc.createElement('button');csvButton.type='button';csvButton.textContent='Download Score CSV';
    actions.append(copyButton,csvButton);
    const status=doc.createElement('p');status.className='beard-export-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const fallback=doc.createElement('textarea');fallback.className='beard-export-fallback';fallback.readOnly=true;fallback.hidden=true;fallback.setAttribute('aria-label','Excel row to select and copy');
    panel.append(title,hint,basic,advanced,actions,status,fallback);report.appendChild(panel);
    function metadata(){return Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value]));}
    function record(){return toRecord(state,metadata());}
    function validate(){
      for(const key of ['student','subtest'])if(!fields[key].value.trim()){status.textContent=key==='student'?'Enter the student code before exporting.':'Enter the subtest or goal label before exporting.';status.classList.add('is-error');fields[key].focus();return false;}
      if(!validIsoDate(fields.date.value)){status.textContent='Choose a valid date before exporting.';status.classList.add('is-error');fields.date.focus();return false;}
      status.classList.remove('is-error');fallback.hidden=true;return true;
    }
    copyButton.addEventListener('click',async()=>{
      if(!validate())return;const value=tsv(record());
      if(await copyText(value,doc))status.textContent='Copied. Paste into the next empty row of the shared Score Log table.';
      else{fallback.value=value;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Select and copy the row below, then paste it into Score Log.';}
    });
    csvButton.addEventListener('click',()=>{if(!validate())return;const row=record();downloadFile(`GoalCheck_${slug(row.Student)}_${row.Date}.csv`,'\uFEFF'+csv(row),'text/csv;charset=utf-8',doc);status.textContent='CSV downloaded. It can be combined with the other staff exports using Score Export Tools.';});
    const controller={element:panel,toRecord:record,refresh(next={}){const recordId=state.recordId,newRun=Boolean(next.recordId&&next.recordId!==recordId);Object.assign(state,next);if(!newRun)state.recordId=recordId;else{state.date=localDate(first(next.date,next.completedAt,new Date()));const defaults={student:first(next.student,next.studentCode),subtest:first(next.subtest,next.title,next.assessment),administrator:next.administrator,grade:next.grade,date:state.date,goalId:next.goalId,goalVersion:first(next.goalVersion,'Current'),supports:next.supports,notes:next.notes};for(const [key,input]of Object.entries(fields))input.value=text(defaults[key]);}}};
    attached.set(report,controller);return controller;
  }

  window.BeardScoreExport=Object.freeze({columns,toRecord,csv,tsv,serializeCsv:csv,serializeTsv:tsv,parseCsv,mergeCsv,attach,localDate,validIsoDate,excelSerialDate,copyText,downloadFile});
})();
