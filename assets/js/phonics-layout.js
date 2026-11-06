(() => {
  'use strict';
  // Fit the whole printed word without splitting its spelling across lines.
  if(typeof window.getComputedStyle!=='function')return;
  const word=document.getElementById('word');
  if(!word)return;
  const context=document.createElement('canvas').getContext('2d');
  if(!context)return;
  let queued=false;
  function fit(){
    queued=false;
    if(!word.clientWidth)return;
    const style=window.getComputedStyle(word),available=word.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0)-4;
    if(available<=0)return;
    const maximum=window.innerWidth<=620?56:72;
    context.font=`${style.fontStyle} ${style.fontWeight} ${maximum}px ${style.fontFamily}`;
    const measured=context.measureText(word.textContent.trim()).width;
    const pixels=Math.max(16,Math.min(maximum,Math.floor(maximum*available/Math.max(1,measured))));
    const value=pixels+'px';
    if(word.style.getPropertyValue('--beard-phonics-word-size')!==value)word.style.setProperty('--beard-phonics-word-size',value);
  }
  function schedule(){if(!queued){queued=true;window.requestAnimationFrame(fit);}}
  new MutationObserver(schedule).observe(word,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
  if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(word);
  window.addEventListener('resize',schedule);
  if(document.fonts?.ready)document.fonts.ready.then(schedule);
  document.fonts?.addEventListener?.('loadingdone',schedule);
  schedule();
})();
