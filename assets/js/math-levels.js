(() => {
  'use strict';
  const file = decodeURIComponent(location.pathname.split('/').pop() || '');
  const isTwenty = /Within20|within_20|Within_20/.test(file);
  const isThousand = /1000/.test(file);
  const isWord = /Word_/.test(file);
  const isTwoStep = /Two_Step/.test(file);
  const isDots = /^subitizing/.test(file);
  const isClock = file === 'Telling Time.html';
  const isFacts = /[Mm]ultiplication/.test(file);
  const isMixedFacts = file === 'Multiplication_and_Division_Single_Digits.html';
  const isNoRegroup = /^2digit/.test(file);
  const additionOnly = /^Addition_/.test(file);
  const defaultMax = isThousand ? 1000 : isTwenty ? 20 : 100;
  const values = {max:defaultMax,operation:additionOnly?'add':'mixed',regrouping:isNoRegroup?'without':'any',factMax:9,fact:0,minuteStep:5,structure:'result',sequence:'same',arrangement:'scattered'};
  // Deep links only select settings that this assessment already exposes.
  // They never start a check or override an addition-only assessment's operation.
  const initialParams = typeof URLSearchParams === 'function' ? new URLSearchParams(location.search || '') : null;
  let bags = new Map();
  let resetNative = null;
  const panel = document.createElement('section');
  panel.className = 'beard-math-levels';
  panel.setAttribute('aria-label','Skill level settings');
  const style = document.createElement('style');
  style.textContent = '.beard-math-levels{box-sizing:border-box;display:flex;flex-wrap:wrap;justify-content:center;gap:.65rem;width:min(880px,calc(100% - 1.5rem));margin:.65rem auto 1rem;padding:.8rem;border:1px solid #bfd7dc;border-radius:14px;background:#fffdf7;color:#254f64;font:700 .9rem/1.4 "Segoe UI",sans-serif}.beard-math-levels label{display:flex;flex-direction:column;gap:.25rem;min-width:145px}.beard-math-levels select{font:inherit;min-height:42px;max-width:100%;padding:.45rem .6rem;border:1px solid #bfd7dc;border-radius:8px;background:white;color:#254f64}.beard-math-levels p{flex-basis:100%;margin:0;text-align:center;font-size:.77rem;font-weight:500}@media(max-width:600px){.beard-math-levels{margin:.5rem auto;padding:.65rem;gap:.5rem}.beard-math-levels label{flex:1;min-width:125px}}@media print{.beard-math-levels{display:none!important}}';
  document.head.appendChild(style);

  function random() {
    return typeof window.BeardRun?.random === 'function' ? window.BeardRun.random() : Math.random();
  }
  function integer(min,max) { return min + Math.floor(random() * (max-min+1)); }
  function choose(options,key) {
    let bag = bags.get(key);
    if (!bag?.length) {
      bag=options.slice();
      for(let i=bag.length-1;i>0;i--){const j=integer(0,i);[bag[i],bag[j]]=[bag[j],bag[i]];}
      bags.set(key,bag);
    }
    return bag.pop();
  }
  function settings() { return {...values}; }
  function description() {
    if(isClock)return 'Time: '+({60:'hour',30:'half-hour',15:'quarter-hour',5:'five-minute',1:'one-minute'}[values.minuteStep]);
    if(isDots)return 'Dots: '+values.arrangement;
    if(isFacts)return (isMixedFacts?values.operation:'multiply')+' · factors through '+values.factMax+(values.fact?' · '+values.fact+' facts':'');
    return 'Within '+values.max+' · '+values.operation+(isWord?' · '+(isTwoStep?values.sequence:values.structure):' · '+values.regrouping+' regrouping');
  }
  function sync() { document.body.dataset.beardLevel = description(); }
  function restart() { bags = new Map(); sync(); }
  function restartThroughControl() {
    restart();
    const controls=[...document.querySelectorAll('button,input[type="button"]')];
    const reset=controls.find(b=>!panel.contains(b)&&!/^beard-/.test(b.id||'')&&/^(reset|play again|start a new check)/i.test((b.textContent||b.value||'').trim()));
    if(reset)reset.click(); else if(resetNative)resetNative();
    document.dispatchEvent(new CustomEvent('beard:settings-changed',{detail:{level:description(),settings:settings()}}));
  }
  function syncFactFamilies() {
    const input=document.getElementById('math-level-fact');
    if(!input)return;
    for(const option of input.options)option.disabled=Number(option.value)>values.factMax;
    if(values.fact>values.factMax)values.fact=0;
    input.value=String(values.fact);
  }
  function select(label,key,options) {
    const field=document.createElement('label');field.textContent=label;
    const input=document.createElement('select');input.id='math-level-'+key;
    for(const [value,text] of options){const option=document.createElement('option');option.value=String(value);option.textContent=text;input.appendChild(option);}
    const requested=initialParams?.get(key);
    if(options.some(([value])=>String(value)===requested))values[key]=typeof values[key]==='number'?Number(requested):requested;
    input.value=String(values[key]);
    input.addEventListener('change',()=>{
      const option=[...input.options].find(option=>option.value===input.value&&!option.disabled);
      if(!option){input.value=String(values[key]);return;}
      values[key]=typeof values[key]==='number'?Number(input.value):input.value;
      syncFactFamilies();restartThroughControl();
    });
    field.appendChild(input);panel.appendChild(field);return input;
  }
  if (isClock) select('Read time to','minuteStep',[[60,'The hour'],[30,'The half-hour'],[15,'The quarter-hour'],[5,'Five minutes'],[1,'One minute']]);
  else if(isDots)select('Dot arrangement','arrangement',[['scattered','Scattered dots'],['dice','Dice groups'],['tenframe','Ten-frames']]);
  else if(isFacts){
    if(isMixedFacts)select('Operation','operation',[['mixed','Multiplication and division'],['multiply','Multiplication only'],['divide','Division only']]);
    select('Fact range','factMax',[[5,'Facts through 5'],[9,'Facts through 9']]);
    select('Focus family','fact',[[0,'All selected facts'],[2,'2 facts'],[3,'3 facts'],[4,'4 facts'],[5,'5 facts'],[6,'6 facts'],[7,'7 facts'],[8,'8 facts'],[9,'9 facts']]);
  } else if(isNoRegroup){select('Operation','operation',[['mixed','Add and subtract'],['add','Add only'],['subtract','Subtract only']]);}
  else {
    const ranges=isThousand?[[100,'Within 100'],[500,'Within 500'],[1000,'Within 1000']]:isTwenty?[[5,'Within 5'],[10,'Within 10'],[20,'Within 20']]:[[20,'Within 20'],[50,'Within 50'],[100,'Within 100']];
    select('Number range','max',ranges);
    if(!additionOnly&&!isTwoStep)select('Operation','operation',[['mixed','Add and subtract'],['add','Add only'],['subtract','Subtract only']]);
    if(isTwoStep)select('Story steps','sequence',[['same','Add/add and subtract/subtract'],['addadd','Add, then add'],['subsub','Subtract, then subtract'],['addsub','Add, then subtract'],['subadd','Subtract, then add'],['all','All four step types']]);
    else if(isWord)select('Unknown part','structure',[['result','Find the result'],['change','Find the change'],['start','Find the starting amount'],['compare','Compare two amounts']]);
    else if(!isTwenty)select('Regrouping','regrouping',[['any','With or without regrouping'],['without','Without regrouping'],['with','With regrouping']]);
  }
  const note=document.createElement('p');note.textContent='Changing a level starts a fresh check. Weekly forms use balanced operation groups within the selected level.';panel.appendChild(note);
  const heading=document.querySelector('h1');if(heading)heading.insertAdjacentElement('afterend',panel);else document.body.prepend(panel);
  syncFactFamilies();
  sync();

  function operation() { return values.operation==='mixed'?choose(['add','subtract'],'operations'):values.operation; }
  function arithmetic() {
    const op=operation()==='subtract'?'-':'+';let a=0,b=0;
    for(let trial=0;trial<10000;trial++){
      a=integer(0,values.max);b=integer(0,op==='+'?values.max-a:a);
      const regroup=op==='+'?(a%10+b%10>=10||Math.floor(a/10)%10+Math.floor(b/10)%10>=10):(a%10<b%10||Math.floor(a/10)%10<Math.floor(b/10)%10);
      if(values.regrouping==='any'||(values.regrouping==='with'&&regroup)||(values.regrouping==='without'&&!regroup))return {a,b,op};
    }
    // The smallest levels have no regrouping cases; use the full selected range.
    return {a,b,op};
  }
  function factPair(mixed=false) {
    const minimum=mixed?1:0;const focused=values.fact;
    const a=focused||integer(minimum,values.factMax),b=integer(minimum,values.factMax);
    const divide=mixed&&(values.operation==='divide'||values.operation==='mixed'&&choose(['multiply','divide'],'fact-operations')==='divide');
    return divide?{a:a*b,b:a,op:'÷',answer:b}:{a,b,op:'×',answer:a*b};
  }
  function wordProblem(names,items) {
    const name=names[integer(0,names.length-1)],other=names.find(n=>n!==name)||'A friend',item=items[integer(0,items.length-1)];
    const type=operation();let a=integer(1,values.max-1),b=integer(1,type==='subtract'?a:values.max-a);
    const result=type==='subtract'?a-b:a+b;let question,answer;
    if(values.structure==='compare'){
      const larger=Math.max(a,b),smaller=Math.min(a,b);question=`${name} has ${larger} ${item}. ${other} has ${smaller} ${item}. How many more ${item} does ${name} have than ${other}?`;answer=larger-smaller;
    } else if(values.structure==='start') {
      question=type==='subtract'?`${name} had some ${item}. ${name} gave away ${b} ${item} and has ${result} left. How many ${item} did ${name} have at first?`:`${name} had some ${item}. ${name} got ${b} more and now has ${result} ${item}. How many ${item} did ${name} have at first?`;answer=a;
    } else if(values.structure==='change'){
      question=type==='subtract'?`${name} had ${a} ${item}. After giving some away, ${name} has ${result} left. How many ${item} did ${name} give away?`:`${name} had ${a} ${item}. After getting some more, ${name} has ${result}. How many more ${item} did ${name} get?`;answer=b;
    } else {
      question=type==='subtract'?`${name} had ${a} ${item}. ${name} gave away ${b}. How many ${item} does ${name} have left?`:`${name} had ${a} ${item}. ${name} got ${b} more. How many ${item} does ${name} have now?`;answer=result;
    }
    return {question,answer};
  }
  function twoStep(names,items) {
    const pool=values.sequence==='all'?['addadd','subsub','addsub','subadd']:values.sequence==='same'?['addadd','subsub']:[values.sequence];
    const sequence=choose(pool,'two-step');const addFirst=sequence.startsWith('add'),addSecond=sequence.endsWith('add');
    const name=names[integer(0,names.length-1)],item=items[integer(0,items.length-1)];const start=integer(1,values.max-1);
    const first=integer(1,addFirst?values.max-start:start),middle=addFirst?start+first:start-first;
    const second=integer(0,addSecond?values.max-middle:middle),answer=addSecond?middle+second:middle-second;
    return {question:`${name} had ${start} ${item}. Then ${name} ${addFirst?'got':'gave away'} ${first} ${item}. After that, ${name} ${addSecond?'received':'used'} ${second} ${item}. How many ${item} does ${name} have now?`,answer};
  }
  function drawDots(board,n) {
    if(values.arrangement==='scattered')return false;
    board.innerHTML='';const view=(board.getAttribute('viewBox')||'0 0 460 320').split(/\s+/).map(Number),W=view[2],H=view[3];
    const ns='http://www.w3.org/2000/svg';
    function shape(tag,attrs){const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);board.appendChild(el);return el;}
    if(values.arrangement==='tenframe'){
      const cell=Math.min((W-50)/5,(H-45)/4),x=(W-cell*5)/2,y=(H-cell*4-12)/2;
      for(let frame=0;frame<2;frame++)for(let row=0;row<2;row++)for(let col=0;col<5;col++)shape('rect',{x:x+col*cell,y:y+(frame*2+row)*cell+frame*12,width:cell,height:cell,fill:'white',stroke:'#648797','stroke-width':1.5});
      for(let i=0;i<n;i++){const frame=Math.floor(i/10),at=i%10;shape('circle',{cx:x+(at%5+.5)*cell,cy:y+(Math.floor(at/5)+frame*2+.5)*cell+frame*12,r:cell*.25,fill:'#234e65'});}
    }else{
      const patterns=[[],[[1,1]],[[0,0],[2,2]],[[0,0],[1,1],[2,2]],[[0,0],[2,0],[0,2],[2,2]],[[0,0],[2,0],[1,1],[0,2],[2,2]],[[0,0],[2,0],[0,1],[2,1],[0,2],[2,2]]];
      const size=Math.min((W-50)/2,(H-45)/2),gap=12,x=(W-size*2-gap)/2,y=(H-size*2-gap)/2;
      const groups=Math.max(1,Math.ceil(n/6));for(let g=0;g<groups;g++){const gx=x+(g%2)*(size+gap),gy=y+Math.floor(g/2)*(size+gap);shape('rect',{x:gx,y:gy,width:size,height:size,rx:10,fill:'#fffdf7',stroke:'#648797','stroke-width':2});for(const [px,py]of patterns[Math.min(6,Math.max(0,n-g*6))])shape('circle',{cx:gx+size*(.22+px*.28),cy:gy+size*(.22+py*.28),r:size*.07,fill:'#234e65'});}
    }
    return true;
  }
  function bind(fn) {
    resetNative=fn;
    document.body.dataset.beardRunAware='true';
    document.addEventListener('beard:run-start',()=>{restart();fn();});
  }
  window.BeardMathLevels=Object.freeze({settings,description,random,integer,choose,restart,bind,arithmetic,factPair,wordProblem,twoStep,drawDots});
})();
