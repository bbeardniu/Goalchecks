(() => {
  const config = window.SentenceCompletionConfig;
  if (!config || !Array.isArray(config.questions) || !config.questions.length) return;
  document.body.dataset.beardRunAware = 'true';
  document.body.dataset.beardLevel = config.grade + ' sentence completion';

  const $ = selector => document.querySelector(selector);
  const app = $('#sentence-completion-app');
  if (!app) return;

  function addStyles() {
    if ($('#sentence-completion-style')) return;
    const style = document.createElement('style');
    style.id = 'sentence-completion-style';
    style.textContent = `
      :root{--sc-navy:#1e4767;--sc-blue:#2878a9;--sc-cream:#fffdf7;--sc-ink:#26394b;--sc-line:#cfe2ed;--sc-green:#237f4e;--sc-red:#bd4141;--sc-gold:#e7b840}
      *{box-sizing:border-box}
      body[data-beard-compact-report="sentence-completion"]{margin:0;min-height:100vh;background:linear-gradient(135deg,#e8f6ff,#fff9e9);color:var(--sc-ink);font-family:"Avenir Next",Avenir,"Segoe UI",sans-serif}
      .sentence-completion-shell{width:min(960px,calc(100% - 2rem));margin:0 auto 2rem;padding:clamp(1rem,3vw,2rem);border:3px solid #fff;border-radius:24px;background:rgba(255,253,247,.97);box-shadow:0 12px 32px rgba(30,71,103,.16)}
      .sentence-completion-heading{display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:center;padding-bottom:1rem;border-bottom:2px dashed #c8dfe9}
      .sentence-completion-badge{display:grid;place-items:center;width:62px;height:62px;border:2px solid #b9ddeb;border-radius:18px;background:#eaf7fb;color:var(--sc-navy);font-size:2rem;font-weight:900;transform:rotate(-3deg)}
      .sentence-completion-eyebrow{margin:0 0 .2rem;color:#537187;font-size:.78rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase}
      .sentence-completion-heading h1{margin:0;color:var(--sc-navy);font-family:"Comic Sans MS","Chalkboard SE",cursive;font-size:clamp(1.7rem,5vw,2.45rem);line-height:1.06}
      .sentence-completion-directions{margin:1rem 0 0;color:#456276;font-size:1.03rem;line-height:1.5}
      .sentence-completion-card{display:grid;grid-template-columns:minmax(220px,.9fr) minmax(0,1.45fr);gap:clamp(.8rem,2vw,1.25rem);align-items:center;margin:1rem 0;padding:clamp(.85rem,2.4vw,1.25rem);border:2px solid #dedac9;border-radius:20px;background:#fffdf7}
      .sentence-completion-art{width:100%;max-width:300px;aspect-ratio:1;border:1px solid #e5dfcc;border-radius:16px;overflow:hidden;background:#fffdf7;box-shadow:0 3px 9px rgba(103,83,54,.07)}
      .sentence-completion-prompt-label{margin:0 0 .5rem;color:#587489;font-size:.78rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
      #sentence{margin:0;color:var(--sc-navy);font-size:clamp(1.35rem,3.5vw,2rem);font-weight:900;line-height:1.34;overflow-wrap:anywhere}
      .sentence-completion-progress{display:flex;justify-content:space-between;gap:.75rem;align-items:center;flex-wrap:wrap;margin:1rem 0 .65rem}
      #progress{margin:0;color:var(--sc-navy);font-weight:900}
      .sentence-completion-tip{margin:0;padding:.4rem .65rem;border-radius:999px;background:#edf7fb;color:#547084;font-size:.88rem;font-weight:800}
      .sentence-completion-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}
      .sentence-completion-option{min-height:62px;padding:.7rem .85rem!important;border:2px solid #b7d7e7!important;border-radius:13px!important;background:#fff!important;color:var(--sc-navy)!important;font:900 clamp(1rem,3.5vw,1.18rem)/1.2 "Avenir Next",Avenir,"Segoe UI",sans-serif!important;box-shadow:0 3px 0 rgba(30,71,103,.12)!important;cursor:pointer;touch-action:manipulation}
      .sentence-completion-option:nth-child(4n+1){border-color:#9fcde1!important;background:#f2fbff!important}
      .sentence-completion-option:nth-child(4n+2){border-color:#f0cf8e!important;background:#fff9e6!important}
      .sentence-completion-option:nth-child(4n+3){border-color:#a8d6b6!important;background:#f1fbf4!important}
      .sentence-completion-option:nth-child(4n){border-color:#e7b4bd!important;background:#fff3f5!important}
      .sentence-completion-option:hover,.sentence-completion-option:focus-visible{filter:brightness(.97);transform:translateY(-2px);outline:3px solid #9bd7f4!important;outline-offset:2px}
      .sentence-completion-option.is-correct{border-color:#5daf78!important;background:#eaf8ef!important;color:#17653a!important}
      .sentence-completion-option.is-incorrect{border-color:#d87572!important;background:#fff0ee!important;color:#a73333!important}
      .sentence-completion-option:disabled{cursor:default;opacity:.78}
      .sentence-completion-controls{display:flex;justify-content:center;gap:.65rem;flex-wrap:wrap;margin-top:1rem}
      .sentence-completion-controls button{min-height:46px;margin:0!important;padding:.68rem 1rem!important;border:0!important;border-radius:10px!important;background:var(--sc-blue)!important;color:#fff!important;font:850 1rem/1.1 "Avenir Next",Avenir,"Segoe UI",sans-serif!important;box-shadow:0 3px 0 rgba(20,73,111,.18)!important;cursor:pointer;touch-action:manipulation}
      .sentence-completion-controls #stopBtn{background:#c85b56!important}
      .sentence-completion-controls #resetBtn{background:#8b6a42!important}
      #feedback{min-height:2.6rem;margin:1rem 0 0;padding:.7rem .85rem;border-radius:10px;background:rgba(255,255,255,.82);font-size:1.08rem;font-weight:900;text-align:center}
      #feedback.feedback-correct{color:var(--sc-green)}
      #feedback.feedback-incorrect{color:var(--sc-red)}
      .sentence-completion-stats{display:flex;justify-content:center;gap:.5rem;flex-wrap:wrap;margin-top:1rem}
      .sentence-completion-stats span{padding:.4rem .6rem;border-radius:999px;background:#edf7fb;color:#47667e;font-size:.86rem;font-weight:850}
      #summary{display:none;margin-top:1.25rem;padding:1rem;border:2px solid var(--sc-line);border-radius:16px;background:#fff}
      #summary h2{margin:0;color:var(--sc-navy);font-family:"Comic Sans MS","Chalkboard SE",cursive}
      .sentence-completion-direct-list{margin:.85rem 0 0;padding-left:1.25rem;line-height:1.5}
      .sentence-completion-direct-list .correct{color:var(--sc-green);font-weight:850}
      .sentence-completion-direct-list .incorrect{color:var(--sc-red);font-weight:850}
      @media(max-width:620px){body[data-beard-compact-report="sentence-completion"]{padding:.7rem}.sentence-completion-shell{width:100%;padding:1rem;border-radius:18px}.sentence-completion-heading,.sentence-completion-card{grid-template-columns:1fr;text-align:center}.sentence-completion-badge{margin:auto}.sentence-completion-art{max-width:220px;margin:auto;width:100%}.sentence-completion-options{grid-template-columns:1fr}.sentence-completion-option{min-height:58px}}
      @media print{.sentence-completion-workspace,.sentence-completion-controls,.sentence-completion-stats{display:none!important}}
    `;
    document.head.append(style);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
      const random = window.BeardRun && typeof window.BeardRun.random === 'function' ? window.BeardRun.random : Math.random;
      const swapIndex = Math.floor(random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  addStyles();
  app.innerHTML = `<main class="sentence-completion-shell" aria-labelledby="activity-title"><header class="sentence-completion-heading"><div class="sentence-completion-badge" aria-hidden="true">✎</div><div><p class="sentence-completion-eyebrow">${escapeHtml(config.grade)} writing goal check</p><h1 id="activity-title">${escapeHtml(config.title)}</h1></div></header><section class="sentence-completion-workspace" id="workArea" aria-label="Sentence completion activity"><p class="sentence-completion-directions">Read the sentence and picture clue. Choose the one word or phrase that makes the sentence correct.</p><section class="sentence-completion-card" aria-label="Sentence question"><div id="scene" class="sentence-completion-art"></div><div><p class="sentence-completion-prompt-label">Choose the best answer</p><p id="sentence" data-beard-prompt aria-live="polite"></p></div></section><div class="sentence-completion-progress"><p id="progress"></p><p class="sentence-completion-tip">Four choices • one best answer</p></div><div id="options" class="sentence-completion-options" aria-label="Answer choices"></div><div class="sentence-completion-controls" aria-label="Assessment controls"><button type="button" id="stopBtn">Stop assessment</button><button type="button" id="resetBtn">Reset check</button></div></section><input id="answer" type="hidden" value=""><p id="feedback" aria-live="polite"></p><div class="sentence-completion-stats" aria-live="polite"><span id="score">Score: 0%</span><span id="attempts">Attempts: 0</span><span id="timer">Time: 0s</span></div><section id="summary" aria-live="polite"></section></main>`;

  const sentence = $('#sentence');
  const scene = $('#scene');
  const options = $('#options');
  const progress = $('#progress');
  const answer = $('#answer');
  const feedback = $('#feedback');
  const summary = $('#summary');
  const score = $('#score');
  const attempts = $('#attempts');
  const timer = $('#timer');
  const workArea = $('#workArea');
  const stopButton = $('#stopBtn');
  const resetButton = $('#resetBtn');
  let questions = [], questionIndex = 0, history = [], currentQuestion = null, locked = false, ended = false, startedAt = 0, questionAt = 0, stoppedSeconds = 0, timerId = null, nextQuestionId = null, settings = {};
  function reportState() { const correct = history.filter(item => item.correct).length; return {assessment:document.title,skill:'Sentence completion',level:document.body.dataset.beardLevel,mode:settings.mode||'practice',formId:settings.formId||'',scoreType:'Accuracy',score:history.length?correct/history.length:null,attempts:history.length,correct,errors:history.length-correct,percentage:history.length?Math.round(correct/history.length*100):null,pending:false,seconds:ended?stoppedSeconds:Math.max(0,(Date.now()-startedAt)/1000),responses:history.map(item=>({...item,prompt:item.question,outcome:item.correct}))}; }

  function updateStats() {
    const total = history.length;
    const correct = history.filter(item => item.correct).length;
    score.textContent = `Score: ${total ? Math.round(correct / total * 100) : 0}%`;
    attempts.textContent = `Attempts: ${total}`;
  }
  function updateTimer() { timer.textContent = `Time: ${Math.max(0, Math.floor((Date.now() - startedAt) / 1000))}s`; }
  function startTimer() { clearInterval(timerId); startedAt = Date.now(); updateTimer(); timerId = setInterval(updateTimer, 1000); }
  function normalizeSentence(text) { return text.replace(/\s+([.,!?;:])/g, '$1'); }
  function cleanSentence(question) { return normalizeSentence(question.s.replace(/_{3,}/, '_____')); }
  function showQuestion() {
    clearTimeout(nextQuestionId);
    if (questionIndex >= questions.length) { stopAssessment(true); return; }
    currentQuestion = questions[questionIndex]; locked = false; questionAt = Date.now(); answer.value = ''; feedback.textContent = ''; feedback.className = ''; feedback.hidden = (settings.mode||'practice') !== 'practice';
    sentence.textContent = cleanSentence(currentQuestion); sentence.dataset.beardPrompt = normalizeSentence(currentQuestion.s);
    window.BeardStorybook.render(scene, currentQuestion.artKey);
    progress.textContent = `Sentence ${questionIndex + 1} of ${questions.length}`;
    options.replaceChildren(...shuffle(currentQuestion.o).map(choice => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'sentence-completion-option'; button.textContent = choice;
      button.addEventListener('click', () => chooseAnswer(choice, button)); return button;
    }));
  }
  function chooseAnswer(choice, selectedButton) {
    if (locked || ended || !currentQuestion) return;
    locked = true; answer.value = choice;
    const correct = choice === currentQuestion.a;
    const practice = (settings.mode||'practice') === 'practice';
    options.querySelectorAll('button').forEach(button => { button.disabled = true; if (practice && button.textContent === currentQuestion.a) button.classList.add('is-correct'); });
    if (practice && !correct) selectedButton.classList.add('is-incorrect');
    history.push({question:normalizeSentence(currentQuestion.s),answer:choice,correct,correctAnswer:currentQuestion.a,seconds:Math.max(0,Math.round((Date.now()-questionAt)/100)/10),elapsedSeconds:Math.max(0,Math.round((Date.now()-startedAt)/100)/10)}); updateStats();
    feedback.textContent = correct ? 'Correct!' : `Incorrect. The best answer is “${currentQuestion.a}.”`; feedback.className = correct ? 'feedback-correct' : 'feedback-incorrect';
    nextQuestionId = setTimeout(() => { questionIndex += 1; showQuestion(); }, 950);
  }
  function directSummary() {
    const total = history.length, correct = history.filter(item => item.correct).length, seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const rows = history.map(item => `<li class="${item.correct ? 'correct' : 'incorrect'}">${escapeHtml(item.question.replace(/_{3,}/, item.answer))} ${item.correct ? '✓' : `✗ (best answer: ${escapeHtml(item.correctAnswer)})`}</li>`).join('');
    summary.innerHTML = `<h2>Assessment Results</h2><p><strong>Time:</strong> ${seconds}s<br><strong>Attempts:</strong> ${total}<br><strong>Score:</strong> ${total ? Math.round(correct / total * 100) : 0}%</p><ol class="sentence-completion-direct-list">${rows || '<li>No responses recorded.</li>'}</ol><div class="sentence-completion-controls"><button type="button" id="playAgain">Start a New Check</button></div>`;
    summary.style.display = 'block'; $('#playAgain').addEventListener('click', resetAssessment);
  }
  function stopAssessment(autoFinished = false) {
    if (ended) return;
    stoppedSeconds = Math.max(0,(Date.now()-startedAt)/1000); ended = true; locked = true; clearTimeout(nextQuestionId); clearInterval(timerId); feedback.textContent = ''; feedback.className = ''; workArea.hidden = true; directSummary();
    document.dispatchEvent(new CustomEvent('beard:report-updated'));
    if (autoFinished) setTimeout(() => stopButton.click(), 0);
  }
  function resetAssessment(runSettings) {
    settings = runSettings && runSettings.mode ? {...runSettings} : {...(window.BeardRunSettings||settings)}; stoppedSeconds = 0;
    clearTimeout(nextQuestionId); clearInterval(timerId); questions = shuffle(config.questions.map((question, index) => ({...question,artKey:`${config.artGroup}:${index + 1}`}))); questionIndex = 0; history = []; currentQuestion = null; locked = false; ended = false;
    summary.innerHTML = ''; summary.style.display = 'none'; workArea.hidden = false; updateStats(); startTimer(); showQuestion();
  }
  stopButton.addEventListener('click', () => stopAssessment());
  resetButton.addEventListener('click', resetAssessment);
  document.addEventListener('beard:run-start',event=>resetAssessment(event.detail&&event.detail.settings));
  window.BeardAssessmentState = {getReport:reportState,reset:()=>resetAssessment(),stop:stopAssessment};
  resetAssessment();
})();
