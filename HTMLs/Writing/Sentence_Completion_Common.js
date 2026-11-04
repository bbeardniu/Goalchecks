(() => {
  const config = window.SentenceCompletionConfig;
  if (!config || !Array.isArray(config.questions) || !config.questions.length) return;

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
      .sentence-completion-card{display:grid;grid-template-columns:minmax(180px,.72fr) minmax(0,1.55fr);gap:clamp(.8rem,2vw,1.25rem);align-items:center;margin:1rem 0;padding:clamp(.85rem,2.4vw,1.25rem);border:2px solid #d6e7ef;border-radius:20px;background:linear-gradient(135deg,#f5fbff,#fffdf6)}
      .sentence-completion-art{min-height:170px;border:2px solid #d1e6f0;border-radius:16px;overflow:hidden;background:#eaf8ff}
      .sentence-completion-art svg{display:block;width:100%;height:100%}
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
      @media(max-width:620px){body[data-beard-compact-report="sentence-completion"]{padding:.7rem}.sentence-completion-shell{width:100%;padding:1rem;border-radius:18px}.sentence-completion-heading,.sentence-completion-card{grid-template-columns:1fr;text-align:center}.sentence-completion-badge{margin:auto}.sentence-completion-art{min-height:145px;max-width:360px;margin:auto;width:100%}.sentence-completion-options{grid-template-columns:1fr}.sentence-completion-option{min-height:58px}}
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
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function hash(value) {
    return [...String(value)].reduce((total, character) => ((total << 5) - total + character.charCodeAt(0)) | 0, 0) >>> 0;
  }

  function sceneFamily(scene) {
    if (/cat|kitten|dog|puppy|rabbit|squirrel|frog|turtle|cow|octopus|spider|bee|butterfly|bird|duck|penguin|horse|fox|owl|eagle|crow|fish|caterpillar|hen|lion|sheep|animal/.test(scene)) return 'animal';
    if (/rain|storm|snow|sun|moon|stars|rainbow|weather|ice|ocean|pond|river|waterfall|beach|cloud|leaves|mountain|garden|flower|tree|soil|hike|forest|trail|nature/.test(scene)) return 'nature';
    if (/book|library|writing|question|classroom|pencil|sharpener|scissors|ruler|board|math|science|museum|map|calendar|story|reading|school|teacher|student|notebook/.test(scene)) return 'learning';
    if (/train|car|bicycle|bus|station|boat|ship|skateboard|runner|crosswalk|parade|firetruck|transport/.test(scene)) return 'transport';
    if (/cake|sandwich|soup|bakery|lunch|lunchbox|picnic|vegetables|apple|food|chef|baker/.test(scene)) return 'food';
    if (/rocket|spaceship|astronaut|scientist|detective|magic|robot|compass|camera|magnify/.test(scene)) return 'discovery';
    if (/ball|game|soccer|team|playground|kite|drum|band|art|paint|music|puzzle|costume/.test(scene)) return 'play';
    return 'home';
  }

  function renderScene(scene, alt) {
    const colors = [{sky:'#dff4ff',ground:'#bfe4a9',accent:'#f7bf5d',detail:'#4d83a5'},{sky:'#f2e6ff',ground:'#c9e9d6',accent:'#ef9a8e',detail:'#7461a5'},{sky:'#fff0d7',ground:'#bfe0bd',accent:'#e99675',detail:'#4f8090'},{sky:'#e6f4ee',ground:'#c5dcf3',accent:'#e8b858',detail:'#5d7da3'}][hash(scene) % 4];
    const family = sceneFamily(scene);
    const base = `<rect width="320" height="180" fill="${colors.sky}"/><rect y="120" width="320" height="60" fill="${colors.ground}"/><circle cx="273" cy="35" r="20" fill="#ffd76c"/><path d="M34 38c13-15 33-12 38 2 15-11 34-2 32 13H29c-5-6-3-11 5-15Z" fill="#fff" opacity=".88"/>`;
    let drawing = '';
    if (family === 'animal') drawing = `<ellipse cx="157" cy="123" rx="66" ry="30" fill="${colors.accent}"/><circle cx="116" cy="93" r="35" fill="${colors.accent}"/><path d="M93 73l8-31 19 26M124 68l20-26 6 33" fill="${colors.accent}" stroke="${colors.detail}" stroke-width="5" stroke-linejoin="round"/><circle cx="105" cy="91" r="4" fill="#26394b"/><circle cx="126" cy="91" r="4" fill="#26394b"/><ellipse cx="115" cy="105" rx="7" ry="5" fill="#26394b"/><path d="M184 115q35-30 54 5" fill="none" stroke="${colors.accent}" stroke-width="13" stroke-linecap="round"/><path d="M131 148v15m27-15v15m29-15v15" stroke="${colors.detail}" stroke-width="7" stroke-linecap="round"/>`;
    else if (family === 'nature') drawing = `<path d="M22 126q34-56 69 0 34-76 75 0 37-48 70 0 28-60 64 0" fill="none" stroke="${colors.detail}" stroke-width="10" stroke-linecap="round" opacity=".9"/><path d="M107 164V76m0 45-30-19m30 2 30-22" stroke="#42825e" stroke-width="8" stroke-linecap="round"/><circle cx="107" cy="68" r="25" fill="${colors.accent}"/><circle cx="77" cy="104" r="15" fill="#f4ce65"/><circle cx="139" cy="96" r="16" fill="#f4ce65"/><path d="M214 70c14-18 40-18 52 0 8 11 1 30-16 32h-41c-15-6-11-23 5-32Z" fill="#fff"/><path d="M220 109v27m17-27v35m17-27v21" stroke="${colors.detail}" stroke-width="5" stroke-linecap="round"/>`;
    else if (family === 'learning') drawing = `<rect x="72" y="48" width="176" height="98" rx="10" fill="#fffdf5" stroke="${colors.detail}" stroke-width="7"/><path d="M160 50v94M89 76h54m-54 22h54m-54 22h54m34-44h46m-46 22h46m-46 22h46" stroke="#8fb7cf" stroke-width="6" stroke-linecap="round"/><path d="M68 151l58-19 17 17-58 19Z" fill="${colors.accent}" stroke="${colors.detail}" stroke-width="5"/><path d="M126 132l21-7 17 17-21 7Z" fill="#f6d5ae" stroke="${colors.detail}" stroke-width="5"/>`;
    else if (family === 'transport') drawing = `<rect x="60" y="78" width="193" height="58" rx="15" fill="${colors.accent}" stroke="${colors.detail}" stroke-width="6"/><rect x="89" y="88" width="47" height="25" rx="4" fill="#eaf8ff"/><rect x="147" y="88" width="47" height="25" rx="4" fill="#eaf8ff"/><rect x="205" y="88" width="30" height="25" rx="4" fill="#eaf8ff"/><circle cx="102" cy="142" r="16" fill="#26394b"/><circle cx="210" cy="142" r="16" fill="#26394b"/><circle cx="102" cy="142" r="6" fill="#fff"/><circle cx="210" cy="142" r="6" fill="#fff"/><path d="M50 160h220" stroke="${colors.detail}" stroke-width="7" stroke-linecap="round"/>`;
    else if (family === 'food') drawing = `<ellipse cx="161" cy="141" rx="92" ry="19" fill="#d0e6f0"/><path d="M91 121q11-68 70-68t70 68" fill="#fffaf0" stroke="${colors.detail}" stroke-width="7"/><path d="M95 120h132l-11 28H105Z" fill="${colors.accent}" stroke="${colors.detail}" stroke-width="6"/><circle cx="134" cy="100" r="16" fill="#ec7768"/><circle cx="164" cy="87" r="17" fill="#f5d368"/><circle cx="191" cy="105" r="15" fill="#78b879"/><path d="M166 64q8-12 17-9" stroke="#4f995d" stroke-width="6" stroke-linecap="round"/>`;
    else if (family === 'discovery') drawing = `<path d="M164 39c29 34 45 62 45 89l-45 27-45-27c0-27 16-55 45-89Z" fill="${colors.accent}" stroke="${colors.detail}" stroke-width="7"/><circle cx="164" cy="101" r="19" fill="#eaf8ff" stroke="${colors.detail}" stroke-width="5"/><path d="M119 129l-39 29 45-9m84-20 39 29-45-9" fill="${colors.detail}"/><path d="M149 154l-15 17m45-17 15 17" stroke="#e87a68" stroke-width="10" stroke-linecap="round"/><circle cx="58" cy="56" r="4" fill="#fff"/><circle cx="90" cy="31" r="3" fill="#fff"/><circle cx="242" cy="61" r="4" fill="#fff"/>`;
    else if (family === 'play') drawing = `<circle cx="126" cy="107" r="45" fill="${colors.accent}" stroke="${colors.detail}" stroke-width="7"/><path d="M126 63v88M82 107h88M95 76l62 62m0-62-62 62" stroke="#fff" stroke-width="6" opacity=".9"/><path d="M210 147l25-84 29 53-31 31Z" fill="#fffdf5" stroke="${colors.detail}" stroke-width="6"/><path d="M236 63l17-30m-1 30 31 3" stroke="${colors.detail}" stroke-width="5" stroke-linecap="round"/>`;
    else drawing = `<rect x="69" y="82" width="182" height="72" rx="8" fill="#fffdf5" stroke="${colors.detail}" stroke-width="7"/><path d="M57 84l103-55 103 55" fill="${colors.accent}" stroke="${colors.detail}" stroke-width="7" stroke-linejoin="round"/><rect x="140" y="111" width="39" height="43" rx="4" fill="#9cc7d9"/><rect x="91" y="107" width="28" height="27" rx="3" fill="#eaf8ff"/><rect x="200" y="107" width="28" height="27" rx="3" fill="#eaf8ff"/><path d="M41 160h238" stroke="${colors.detail}" stroke-width="7" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 320 180" role="img" aria-label="${escapeHtml(alt)}"><title>${escapeHtml(alt)}</title>${base}${drawing}</svg>`;
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
  let questions = [], questionIndex = 0, history = [], currentQuestion = null, locked = false, ended = false, startedAt = 0, timerId = null, nextQuestionId = null;

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
    currentQuestion = questions[questionIndex]; locked = false; answer.value = ''; feedback.textContent = ''; feedback.className = '';
    sentence.textContent = cleanSentence(currentQuestion); sentence.dataset.beardPrompt = normalizeSentence(currentQuestion.s);
    scene.innerHTML = renderScene(currentQuestion.scene, `Original illustration for: ${cleanSentence(currentQuestion)}`);
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
    options.querySelectorAll('button').forEach(button => { button.disabled = true; if (button.textContent === currentQuestion.a) button.classList.add('is-correct'); });
    if (!correct) selectedButton.classList.add('is-incorrect');
    history.push({question:normalizeSentence(currentQuestion.s),answer:choice,correct,correctAnswer:currentQuestion.a}); updateStats();
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
    ended = true; locked = true; clearTimeout(nextQuestionId); clearInterval(timerId); feedback.textContent = ''; feedback.className = ''; workArea.hidden = true; directSummary();
    if (autoFinished) setTimeout(() => stopButton.click(), 0);
  }
  function resetAssessment() {
    clearTimeout(nextQuestionId); clearInterval(timerId); questions = shuffle(config.questions); questionIndex = 0; history = []; currentQuestion = null; locked = false; ended = false;
    summary.innerHTML = ''; summary.style.display = 'none'; workArea.hidden = false; updateStats(); startTimer(); showQuestion();
  }
  stopButton.addEventListener('click', () => stopAssessment());
  resetButton.addEventListener('click', resetAssessment);
  resetAssessment();
})();
