(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function seededRandom(text) {
    let seed=2166136261;
    for(const c of String(text))seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
    return () => {seed=(seed+0x6D2B79F5)|0;let n=Math.imul(seed^seed>>>15,1|seed);n^=n+Math.imul(n^n>>>7,61|n);return ((n^n>>>14)>>>0)/4294967296;};
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
    let phase='ready',starting=false,settings=null,responses=[],recordId='',finishedSeconds=null,restartTimer=null;
    const formCode=()=>`F-${Date.now().toString(36)}-${originalRandom().toString(36).slice(2,10)}`;
    const level=()=>doc.body.dataset.beardLevel||'Current activity';
    const style=doc.createElement('style');style.id='beard-session-style';style.textContent=`
      body{display:block!important;height:auto!important;align-items:initial!important;justify-content:initial!important}body>.wrap,body>.assessment-shell{margin-left:auto!important;margin-right:auto!important}
      body[data-beard-auto-start] #startBtn,body[data-beard-auto-start] #startButton{display:none!important}
      .beard-session-meta{padding:.7rem;border:1px solid #d5e4de;border-radius:10px;background:#f0f7f2;font:.88rem/1.5 "Segoe UI",Arial,sans-serif;margin:.7rem 0}.beard-session-meta p{margin:.15rem 0!important}
      body.beard-check-mode #feedback,body.beard-check-mode #result,body.beard-check-mode #beard-feedback{visibility:hidden!important}
      body.beard-check-mode .sentence-completion-option.is-correct,body.beard-check-mode .sentence-completion-option.is-incorrect,body.beard-check-mode .choice.is-correct,body.beard-check-mode .choice.is-incorrect,body.beard-check-mode .choice.correct,body.beard-check-mode .choice.incorrect{background:#f3f7f6!important;border-color:#b7d2ca!important;color:#26394b!important}
      @media print{#beard-print-report{max-height:none!important;overflow:visible!important}}
    `;doc.head.append(style);doc.body.dataset.beardAutoStart='true';
    function cancelPending(){for(const id of timeouts)clearTimer(id);timeouts.clear();}
    function cancelRestart(){if(restartTimer!==null){clearTimer(restartTimer);restartTimer=null;}}
    function begin({formId}={}){
      if(starting)return settings;
      cancelRestart();cancelPending();responses=[];finishedSeconds=null;recordId=win.crypto?.randomUUID?.()||`run-${Date.now()}-${originalRandom().toString(36).slice(2)}`;
      // Keep the existing single-attempt scoring rules; no purpose choice is needed.
      settings={mode:'weekly',level:level(),assessment:doc.title||'Goal Check',formId:formId||formCode()};
      const random=seededRandom(`${new URL(sourceUrl).pathname}|${settings.level}|${settings.formId}`);
      win.BeardRunSettings=settings;win.BeardRun={random,settings};win.Math.random=random;
      phase='running';starting=true;doc.body.classList.add('beard-check-mode');doc.body.dataset.beardMode=settings.mode;
      try{
        onStart(settings);
        const aware=doc.body.dataset.beardRunAware==='true'||Boolean(win.BeardMathLevels)||Boolean(win.BeardAssessment)||Boolean(win.BeardAssessmentState);
        if(!aware&&!isFluency){
          const reset=[...doc.querySelectorAll('button,input[type="button"]')].find(b=>!b.closest('.beard-report-actions')&&/^(reset|play again|start a new check)/i.test((b.textContent||b.value||'').trim()));
          if(reset)reset.click();
          const start=doc.querySelector('#startBtn,#startButton');if(start&&!start.disabled&&!start.hidden)start.click();
        }
        doc.dispatchEvent(new win.CustomEvent('beard:run-start',{bubbles:true,detail:{settings}}));
        clock.start({restart:true});
      }finally{starting=false;}
      return settings;
    }
    // Native handlers finish first. A reset plus its settings event starts once.
    function showReady(){
      if(starting)return;
      cancelRestart();cancelPending();phase='ready';finishedSeconds=null;clock.reset();onReady();
      restartTimer=setTimer(()=>{restartTimer=null;begin();},0);
    }
    function addResponse(response){if(phase==='running')responses.push({...response,elapsedSeconds:clock.elapsedMilliseconds()/1000});}
    function finish(){cancelRestart();if(phase==='running'){clock.stop();finishedSeconds=clock.elapsedMilliseconds()/1000;}phase='finished';return finishedSeconds??clock.elapsedMilliseconds()/1000;}
    function review(seconds=0){cancelRestart();cancelPending();phase='finished';finishedSeconds=Math.max(0,Number(seconds)||0);if(clock.restore)clock.restore(finishedSeconds);else clock.stop();}
    function context(extra={}){
      const totalSeconds=extra.totalSeconds??finishedSeconds??clock.elapsedMilliseconds()/1000;
      return {...(settings||{level:level(),assessment:doc.title}),recordId,firstMinute:minuteData(responses,totalSeconds),responses:responses.slice(),totalSeconds,...extra};
    }
    function attachReport(report,extra={}){
      if(!report)return;
      const data=context(extra),fm=data.firstMinute;
      let meta=report.querySelector('.beard-session-meta');
      if(!meta){meta=doc.createElement('section');meta.className='beard-session-meta';report.insertBefore(meta,report.querySelector('.beard-answer-history')||report.firstChild?.nextSibling||null);}
      const timeText=fm&&fm.attempts!=null?`First ${Math.min(60,fm.seconds||0).toFixed(1)} seconds: ${fm.correct==null?'Pending':fm.correct} correct / ${fm.attempts} attempts${fm.accuracy==null?'':` · ${Math.round(fm.accuracy*100)}%`}`:'First-minute response breakdown is not available for this teacher-scored task.';
      const content=`<p><strong>Skill level:</strong> ${escape(data.level)}</p><p>${escape(timeText)}</p>${data.supports?`<p><strong>Supports:</strong> ${escape(data.supports)}</p>`:''}`;
      if(meta.innerHTML!==content)meta.innerHTML=content;
      return data;
    }
    const allowed=target=>target?.closest?.('.beard-report-actions,.beard-summary-actions,#beard-teacher-banner,.beard-math-levels,[data-beard-level-controls],.level-controls,.settings,.assessment-settings')||target?.matches?.('select');
    win.addEventListener('keydown',event=>{
      if(phase!=='running'&&event.target.matches?.('input,textarea,[contenteditable="true"]'))return;
      if(event.target.matches?.('select')&&!event.target.matches('#hourSelect,#minuteSelect')){event.stopImmediatePropagation();return;}
      if(phase==='finished'&&event.target.closest?.('#summary,#results,.summary,.beard-fluency-summary')){if(/^[1-5]$/.test(event.key))event.stopImmediatePropagation();return;}
      if(phase!=='running'&&!starting&&!allowed(event.target)&&/^[1-5]$|^Enter$|^ $/.test(event.key)){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    win.addEventListener('click',event=>{
      if(starting||phase==='running'||allowed(event.target)||(phase==='finished'&&event.target.closest?.('#summary,#results,.summary,.beard-fluency-summary,[data-beard-review-action]')))return;
      const button=event.target.closest?.('button,input[type="button"],.choice');if(!button)return;
      const label=(button.textContent||button.value||'').trim();
      if(/^(reset|play again|start a new check|new check|print|close)/i.test(label)||(isFluency&&/^(start timer|add)(\s|$)/i.test(label)))return;
      event.preventDefault();event.stopImmediatePropagation();
    },true);
    doc.addEventListener('beard:settings-changed',()=>{if(!starting)showReady();});
    showReady();
    return {begin,showReady,review,addResponse,finish,context,attachReport,cancelPending,get settings(){return settings;},get phase(){return phase;},get starting(){return starting;},get responses(){return responses.slice();}};
  }
  window.BeardSessions=Object.freeze({create,seededRandom,minuteData});
})();
