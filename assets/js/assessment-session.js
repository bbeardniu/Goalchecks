(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function seededRandom(text) {
    let seed=2166136261;
    for(const c of String(text)) seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
    return () => { seed=(seed+0x6D2B79F5)|0;let n=Math.imul(seed^seed>>>15,1|seed);n^=n+Math.imul(n^n>>>7,61|n);return ((n^n>>>14)>>>0)/4294967296; };
  }
  function minuteData(responses,totalSeconds) {
    const rows=responses.filter(r=>Number.isFinite(r.elapsedSeconds)&&r.elapsedSeconds<=60);
    const known=rows.filter(r=>r.outcome===true||r.outcome===false);
    const correct=known.filter(r=>r.outcome===true).length;
    return {correct:known.length===rows.length?correct:null,attempts:rows.length,errors:known.length===rows.length?rows.length-correct:null,accuracy:rows.length&&known.length===rows.length?correct/rows.length:null,seconds:Math.min(60,Math.max(0,totalSeconds))};
  }
  function create({doc,win,clock,hud,sourceUrl,onStart=()=>{},onReady=()=>{},isFluency=false}) {
    const originalRandom=win.Math.random.bind(win.Math);
    const setTimer=win.setTimeout.bind(win),clearTimer=win.clearTimeout.bind(win);
    const timeouts=new Set();
    win.setTimeout=(callback,delay,...args)=>{const id=setTimer(()=>{timeouts.delete(id);if(typeof callback==='function')callback(...args);},delay);timeouts.add(id);return id;};
    win.clearTimeout=id=>{timeouts.delete(id);clearTimer(id);};
    let phase='ready',starting=false,settings=null,responses=[],recordId='',finishedSeconds=null;
    const formCode=()=>`F-${Date.now().toString(36).slice(-5).toUpperCase()}-${Math.floor(Math.random()*1679616).toString(36).padStart(4,'0').toUpperCase()}`;
    const style=doc.createElement('style');style.id='beard-session-style';style.textContent=`
      body{display:block!important;height:auto!important;align-items:initial!important;justify-content:initial!important}body>.wrap,body>.assessment-shell{margin-left:auto!important;margin-right:auto!important}#beard-run-setup{box-sizing:border-box;position:relative;z-index:9996;width:min(960px,calc(100% - 24px));margin:0 auto 1.1rem;padding:1rem;border:2px solid #9ac7bd;border-radius:16px;background:#fffdf7;box-shadow:0 6px 20px #24463b16;color:#26394b;font:500 .94rem/1.45 "Segoe UI",Arial,sans-serif;text-align:left}
      #beard-run-setup h2{margin:0 0 .4rem!important;font-size:1.3rem!important}#beard-run-setup p{margin:.4rem 0}.beard-run-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem;margin:.8rem 0}.beard-run-fields label{display:flex;flex-direction:column;gap:.25rem;font-size:.82rem;font-weight:750}.beard-run-fields input,.beard-run-fields select{box-sizing:border-box;width:100%;min-height:42px;padding:.45rem .6rem!important;font:inherit!important}.beard-run-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.7rem}.beard-run-note{color:#526b68;font-size:.82rem}#beard-run-status{color:#9b3b32;font-weight:750}.beard-session-meta{padding:.7rem;border:1px solid #d5e4de;border-radius:10px;background:#f0f7f2;font:.88rem/1.5 "Segoe UI",Arial,sans-serif;margin:.7rem 0}.beard-session-meta p{margin:.15rem 0!important}.beard-session-open{font-size:.73rem!important;padding:.35rem .5rem!important;box-shadow:none!important;white-space:nowrap}
      body.beard-run-ready [data-beard-prompt],body.beard-run-ready #problem,body.beard-run-ready #letter,body.beard-run-ready #word,body.beard-run-ready #sentence,body.beard-run-ready #passage,body.beard-run-ready #options,body.beard-run-ready .choices,body.beard-run-ready .word-bank,body.beard-run-ready .sentence-strip{visibility:hidden!important}
      body.beard-run-ready .teacher-buttons,body.beard-run-ready #answer,body.beard-run-ready #answerInput,body.beard-run-ready #stopBtn,body.beard-run-ready #stopButton,body.beard-run-ready #beard-finish-read,body.beard-run-ready #beard-save-minute{visibility:hidden!important}body.beard-run-ready #startBtn,body.beard-run-ready #startButton{display:none!important}
      body.beard-check-mode #feedback,body.beard-check-mode #result,body.beard-check-mode #beard-feedback{visibility:hidden!important}
      body.beard-check-mode .sentence-completion-option.is-correct,body.beard-check-mode .sentence-completion-option.is-incorrect,body.beard-check-mode .choice.is-correct,body.beard-check-mode .choice.is-incorrect,body.beard-check-mode .choice.correct,body.beard-check-mode .choice.incorrect{background:#f3f7f6!important;border-color:#b7d2ca!important;color:#26394b!important}
      @media(max-width:620px){.beard-run-fields{grid-template-columns:1fr 1fr}#beard-run-setup{font-size:.88rem;padding:.8rem}.beard-run-fields label:last-child{grid-column:1/-1}}@media print{#beard-run-setup,.beard-session-open,.beard-score-export{display:none!important}#beard-print-report{max-height:none!important;overflow:visible!important}}
    `;doc.head.append(style);
    const panel=doc.createElement('section');panel.id='beard-run-setup';panel.setAttribute('aria-label','Check settings');
    panel.innerHTML=`<h2>Ready for your goal check?</h2><p>Choose the skill level on this page, then start when the student is ready.</p><div class="beard-run-fields"><label>Purpose<select name="mode"><option value="weekly">Weekly Check</option><option value="baseline">Baseline</option><option value="practice">Practice</option></select></label><label>Form ID<input name="formId" maxlength="80" autocomplete="off"></label><label>Student code (optional here)<input name="student" maxlength="80" autocomplete="off" placeholder="Enter privately"></label><label>Goal / subtest label<input name="subtest" maxlength="180" autocomplete="off" placeholder="Match your Excel label"></label><label>Goal version / IEP date<input name="goalVersion" maxlength="80" value="Current" autocomplete="off"></label><label>Support / read-aloud notes<input name="supports" maxlength="300" autocomplete="off" placeholder="Independent, adult reads directions…"></label></div><p class="beard-run-note">Baseline and Weekly Check hide the shared answer feedback. Keep support and level consistent when comparing scores. A form ID repeats the random sequence within this activity and level; it is not a validated difficulty rating.</p><p class="beard-run-note">The chime marks one minute. Students may continue; reports separate the first minute from the whole session where responses are timed.</p><div class="beard-run-actions"><button type="button" data-begin>Start check</button><button type="button" data-new-form>New form ID</button></div><p id="beard-run-status" role="status"></p>`;
    panel.querySelector('[name="formId"]').value=formCode();
    const banner=doc.getElementById('beard-teacher-banner');
    doc.body.prepend(panel);
    const open=doc.createElement('button');open.type='button';open.className='beard-session-open';open.textContent='Check settings';
    (banner?.querySelector('.beard-banner-left')||banner||panel).append(open);
    function cancelPending(){for(const id of timeouts)clearTimer(id);timeouts.clear();}
    function values(){return Object.fromEntries([...panel.querySelectorAll('input,select')].map(el=>[el.name,el.value.trim()]));}
    function level(){return doc.body.dataset.beardLevel||'Current activity';}
    function resetState(){responses=[];recordId=win.crypto?.randomUUID?.()||`run-${Date.now()}-${originalRandom().toString(36).slice(2)}`;finishedSeconds=null;}
    function showReady({newForm=false}={}){
      cancelPending();phase='ready';starting=false;clock.reset();finishedSeconds=null;doc.body.classList.add('beard-run-ready');panel.hidden=false;
      if(newForm)panel.querySelector('[name="formId"]').value=formCode();
      onReady();
    }
    function begin(){
      const data=values();if(!data.formId){panel.querySelector('#beard-run-status').textContent='Enter a form ID or choose New form ID.';return;}
      panel.querySelector('#beard-run-status').textContent='';cancelPending();resetState();
      settings={...data,mode:data.mode||'weekly',level:level(),assessment:doc.title||'Goal Check',formId:data.formId};
      const random=seededRandom(`${new URL(sourceUrl).pathname}|${settings.level}|${settings.formId}`);
      win.BeardRunSettings=settings;win.BeardRun={random,settings};win.Math.random=random;
      phase='running';starting=true;doc.body.classList.remove('beard-run-ready');doc.body.classList.toggle('beard-check-mode',settings.mode!=='practice');doc.body.dataset.beardMode=settings.mode;panel.hidden=true;
      onStart(settings);
      const aware=doc.body.dataset.beardRunAware==='true'||Boolean(win.BeardMathLevels)||Boolean(win.BeardAssessment)||Boolean(win.BeardAssessmentState);
      if(!aware&&!isFluency){
        const reset=[...doc.querySelectorAll('button,input[type="button"]')].find(b=>!panel.contains(b)&&!b.closest('.beard-score-export')&&(/^(reset|play again|start a new check)/i.test((b.textContent||b.value||'').trim())));
        if(reset)reset.click();
        const start=doc.querySelector('#startBtn,#startButton');
        if(start&&!start.disabled&&!start.hidden)start.click();
      }
      doc.dispatchEvent(new win.CustomEvent('beard:run-start',{bubbles:true,detail:{settings}}));
      starting=false;clock.start({restart:true});
      return settings;
    }
    function addResponse(response){if(phase!=='running')return;responses.push({...response,elapsedSeconds:clock.elapsedMilliseconds()/1000});}
    function finish(){if(phase==='running'){clock.stop();finishedSeconds=clock.elapsedMilliseconds()/1000;phase='finished';}return finishedSeconds??clock.elapsedMilliseconds()/1000;}
    function context(extra={}){
      const totalSeconds=extra.totalSeconds??finishedSeconds??clock.elapsedMilliseconds()/1000;
      const current=settings||{...values(),level:level(),mode:'weekly',assessment:doc.title};
      return {...current,recordId,firstMinute:minuteData(responses,totalSeconds),responses:responses.slice(),totalSeconds,...extra};
    }
    function attachReport(report,extra={}){
      if(!report)return;
      const data=context(extra),fm=data.firstMinute;
      let meta=report.querySelector('.beard-session-meta');
      if(!meta){meta=doc.createElement('section');meta.className='beard-session-meta';report.insertBefore(meta,report.querySelector('.beard-answer-history')||report.firstChild?.nextSibling||null);}
      const timeText=fm&&fm.attempts!=null?`First ${Math.min(60,fm.seconds||0).toFixed(1)} seconds: ${fm.correct==null?'Pending':fm.correct} correct / ${fm.attempts} attempts${fm.accuracy==null?'':` · ${Math.round(fm.accuracy*100)}%`}`:'First-minute response breakdown is not available for this teacher-scored task.';
      const content=`<p><strong>${escape(({weekly:'Weekly Check',baseline:'Baseline',practice:'Practice'})[data.mode]||data.mode)}</strong> · ${escape(data.level)} · <strong>Form:</strong> ${escape(data.formId)}</p><p>${escape(timeText)}</p>${data.supports?`<p><strong>Supports:</strong> ${escape(data.supports)}</p>`:''}`;
      if(meta.innerHTML!==content)meta.innerHTML=content;
      if(window.BeardScoreExport)report._beardExportController=window.BeardScoreExport.attach(report,data);
      return data;
    }
    function allowed(target){return target?.closest?.('#beard-run-setup,.beard-score-export,.beard-report-actions,.beard-summary-actions,#beard-teacher-banner,.beard-math-levels,[data-beard-level-controls],.level-controls,.settings,.assessment-settings')||target?.matches?.('select');}
    win.addEventListener('keydown',event=>{if(event.target.closest?.('#beard-run-setup,.beard-score-export')||(event.target.matches?.('select')&&!event.target.matches('#hourSelect,#minuteSelect'))){event.stopImmediatePropagation();return}if(phase==='finished'&&event.target.closest?.('#summary,#results,.summary,.beard-fluency-summary')){if(/^[1-5]$/.test(event.key))event.stopImmediatePropagation();return}if((phase==='ready'||phase==='finished')&&!starting&&!allowed(event.target)){if(/^[1-5]$|^Enter$|^ $/.test(event.key)){event.preventDefault();event.stopImmediatePropagation();}}},true);
    win.addEventListener('click',event=>{
      if(starting||phase==='running'||allowed(event.target)||(phase==='finished'&&event.target.closest?.('#summary,#results,.summary,.beard-fluency-summary,[data-beard-review-action]')))return;
      const button=event.target.closest?.('button,input[type="button"],.choice');if(!button)return;
      const label=(button.textContent||button.value||'').trim();
      if(/^(reset|play again|start a new check|print|close)/i.test(label)||(isFluency&&/^start timer/i.test(label)))return;
      event.preventDefault();event.stopImmediatePropagation();
    },true);
    panel.querySelector('[data-begin]').addEventListener('click',begin);
    panel.querySelector('[data-new-form]').addEventListener('click',()=>{panel.querySelector('[name="formId"]').value=formCode();});
    open.addEventListener('click',()=>{showReady();panel.scrollIntoView?.({block:'start',behavior:'smooth'});});
    doc.addEventListener('beard:settings-changed',()=>{if(!starting)showReady();});
    showReady();
    return {begin,showReady,addResponse,finish,context,attachReport,cancelPending,get settings(){return settings;},get phase(){return phase;},get starting(){return starting;},get responses(){return responses.slice();}};
  }
  window.BeardSessions=Object.freeze({create,seededRandom,minuteData});
})();
