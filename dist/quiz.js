const byId = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const preset = subjects[params.get('subject')];
const unitIds = [...new Set(Object.values(subjects).flatMap(subject => Object.keys(subject.units)))];
const selectedUnit = params.get('unit');
let questions = [];
let current = 0;
let timer;
let deadline;
let seconds;
let history = [];
let studentName;
let startedAt;
let startedTick;
let elapsedSeconds;
let report;

function chip(group, value, label, checked) {
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.name = group;
  box.value = value;
  box.checked = checked;
  const wrap = document.createElement('label');

  wrap.append(box, ' ' + label);
  byId(group).append(wrap);
}
for (const [id, subject] of Object.entries(subjects)) {
  chip('subjects', id, subject.name, !preset || preset === subject);
}
for (const id of unitIds) {
  chip('units', id, 'Unit ' + id, !unitIds.includes(selectedUnit) || selectedUnit === id);
}
byId('all-subjects').onclick = () => {
  for (const input of byId('subjects').querySelectorAll('input')) input.checked = true;
  configure();
};
for (let count = 10; count <= 20; count++) byId('length').add(new Option(count, count));

function selected(group) {
  return [...byId(group).querySelectorAll(':checked')].map(input => input.value);
}
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function pools() {
  return selected('subjects').map(id => {
    const entries = new Set(selected('units').flatMap(unit =>
      (subjects[id].units[unit]?.words || []).map(item => item.word)));
    return { id, entries: [...entries] };
  });
}
function configure() {
  const count = new Set(pools().flatMap(group => group.entries.map(term => term.toLowerCase()))).size;
  const valid = count >= Number(byId('length').value);
  const names = selected('subjects').map(id => subjects[id].name);
  const units = selected('units');
  byId('all-subjects').disabled = names.length === Object.keys(subjects).length;
  byId('all-subjects').textContent = byId('all-subjects').disabled ? 'All subjects selected' : 'Select all subjects';
  const mix = new Intl.ListFormat('en').format(names);
  const scope = units.length === 1 ? 'Unit ' + units[0] : 'Units ' + new Intl.ListFormat('en').format(units);
  byId('pool').textContent = count ? mix + ' · ' + scope + ' · ' + count + ' words'
    : 'Choose at least one subject and one unit.';
  byId('start').disabled = !valid;
}
byId('setup').addEventListener('change', configure);
configure();

// Rotate through shuffled subject pools so every selected subject gets questions.
function chooseWords(groups, count) {
  const decks = shuffle(groups).map(group => ({ ...group, deck: shuffle(group.entries) }));
  const picked = [];
  const used = new Set();
  while (picked.length < count && decks.some(group => group.deck.length)) {
    for (const group of decks) {
      while (group.deck.length) {
        const term = group.deck.pop();
        if (used.has(term.toLowerCase())) continue;
        used.add(term.toLowerCase());
        picked.push({ term, group });
        break;
      }
      if (picked.length === count) break;
    }
  }
  return shuffle(picked);
}

// Keep terms with overlapping meanings out of the same set of answers.
const overlaps = [
  ['multiply','multiplication'], ['represent','representation'], ['chronological order','sequence of events'],
  ['problem','challenge'], ['details','key details','text evidence'], ['plot','events','sequence of events','story structure'],
  ['descriptive words','adjective'], ['graph','bar graph','picture graph'], ['figurative language','simile','metaphor'],
  ['characters','major character','minor characters'], ['compare and contrast','compare','contrast'],
  ['topic','main idea'], ['text structure','story structure','description','chronological order','problem and solution','compare and contrast','cause and effect'],
  ['summary','retell'], ['heading','title'], ['value','place value']
];
function compatible(a, b) {
  return a !== b && !overlaps.some(set => set.includes(a.toLowerCase()) && set.includes(b.toLowerCase()));
}
function makeQuestion({ term, group }, mode) {
  const choices = [term];
  for (const candidate of shuffle(group.entries)) {
    if (choices.every(other => compatible(other, candidate))) choices.push(candidate);
    if (choices.length === 4) break;
  }
  return { term, subject: subjects[group.id].name, mode, choices: shuffle(choices) };
}
byId('setup').onsubmit = event => {
  event.preventDefault();
  if (byId('start').disabled) return;
  const picks = chooseWords(pools(), Number(byId('length').value));
  const style = byId('style').value;
  const modes = shuffle(picks.map((_, index) => style === 'mixed' ? (index % 2 ? 'word' : 'definition') : style));
  questions = picks.map((pick, index) => makeQuestion(pick, modes[index]));
  current = 0;
  history = [];
  seconds = Number(byId('timing').value);
  byId('setup').hidden = true;
  byId('play').hidden = false;
  studentName = byId('student-name').value.trim();
  startedAt = new Date();
  startedTick = performance.now();
  showQuestion();
};
function showQuestion() {
  const q = questions[current];
  const chooseWord = q.mode === 'word';
  byId('progress').textContent = q.subject + ' · Question ' + (current + 1) + ' of ' + questions.length;
  byId('instruction').textContent = chooseWord ? 'Which word matches this definition?' : 'What does this word mean?';
  byId('prompt').textContent = chooseWord ? definitions[q.term] : q.term;
  byId('quiz-art').innerHTML = exhibitArt(q.term);
  byId('quiz-caption').textContent = clueBook[q.term][1];
  byId('worked-example').hidden = true;
  byId('answers').replaceChildren();
  for (const term of q.choices) {
    const button = document.createElement('button');
    button.textContent = chooseWord ? term : definitions[term];
    button.onclick = () => answer(term);
    byId('answers').append(button);
  }
  byId('feedback').textContent = '';
  byId('next').hidden = true;
  byId('clock').hidden = !seconds;
  byId('prompt').focus();
  if (seconds) {
    deadline = Date.now() + seconds * 1000;
    function tick() {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      byId('clock').textContent = left + ' seconds left';
      if (!left) answer(null);
    }
    tick();
    timer = setInterval(tick, 200);
  }
}
function answer(choice) {
  if (history.length > current) return;
  clearInterval(timer);
  if (seconds && Date.now() >= deadline) choice = null;
  const q = questions[current];
  history.push(choice);
  if (history.length === questions.length) {
    elapsedSeconds = Math.max(0, Math.round((performance.now() - startedTick) / 1000));
  }
  [...byId('answers').children].forEach((button, i) => {
    button.disabled = true;
    if (q.choices[i] === q.term) button.classList.add('correct');
    else if (q.choices[i] === choice) button.classList.add('wrong');
  });
  const fact = q.term + ' — ' + definitions[q.term];
  byId('feedback').textContent = choice === q.term ? 'Correct!' : (choice === null ? 'Time is up. ' : 'Correct answer: ') + fact;
  byId('worked-example').textContent = lessons[q.term][1];
  byId('worked-example').hidden = false;
  byId('next').textContent = current + 1 === questions.length ? 'See my score →' : 'Next question →';
  byId('next').hidden = false;
  byId('next').focus();
}
byId('next').onclick = () => {
  current++;
  if (current < questions.length) return showQuestion();
  const missed = questions.filter((q, i) => q.term !== history[i]);
  const correct = questions.length - missed.length;
  byId('play').hidden = true;
  byId('results').hidden = false;
  byId('score').textContent = 'Your score: ' + correct + ' / ' + questions.length;
  byId('summary').textContent = Math.round(correct / questions.length * 100) + '% correct';
  const unitNames = selected('units').map(id => 'Unit ' + id).join(' + ');
  const timing = seconds ? seconds + ' seconds per question' : 'Untimed';
  const duration = Math.floor(elapsedSeconds / 60) + ' min ' + (elapsedSeconds % 60) + ' sec';
  const date = startedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  byId('result-name').textContent = studentName ? 'Student: ' + studentName : '';
  byId('result-name').hidden = !studentName;
  report = { studentName, correct, total: questions.length, percent: Math.round(correct / questions.length * 100),
    date, duration, unitNames, timing, breakdown: [], practice: missed.map(q => q.term) };
  byId('round-info').textContent = [date, 'Time taken: ' + duration, unitNames, timing].join(' · ');
  byId('pdf-status').hidden = true;
  byId('subject-scores').replaceChildren();
  const icons = { reading: '📖', writing: '✏️', math: '🔢' };
  for (const [id, subject] of Object.entries(subjects)) {
    const round = questions.filter(q => q.subject === subject.name);
    if (!round.length) continue;
    const earned = round.length - missed.filter(q => q.subject === subject.name).length;
    report.breakdown.push({ name: subject.name, earned, total: round.length, color: subject.canvas });
    const badge = document.createElement('span');
    badge.style.cssText = 'display:inline-block;margin:3px 6px 3px 0;padding:4px 10px;border-radius:8px;font-weight:bold';
    badge.style.backgroundColor = subject.canvas;
    badge.style.color = subject.ink;
    badge.textContent = icons[id] + ' ' + subject.name + ' ' + earned + '/' + round.length;
    byId('subject-scores').append(badge, ' ');
  }
  byId('practice-terms').textContent = missed.length
    ? '🌱 Words to practice: ' + missed.map(q => q.term).join(', ')
    : '⭐ Every word correct!';
  byId('copy-status').textContent = 'Copy your scorecard to paste into an email or a Toddle response.';
  byId('manual-copy').hidden = true;
  byId('review').replaceChildren();
  if (missed.length) {
    const title = document.createElement('h3');
    title.textContent = 'Words to practice';
    const list = document.createElement('ul');
    for (const q of missed) {
      const item = document.createElement('li');
      item.textContent = q.term + ' — ' + definitions[q.term];
      list.append(item);
    }
    byId('review').append(title, list);
  }
  byId('score').focus();
};
byId('again').onclick = () => {
  byId('results').hidden = true;
  byId('setup').hidden = false;
  byId('start').focus();
};

byId('copy-results').onclick = async () => {
  const card = byId('scorecard');
  const plain = [...card.children].map(row => row.textContent.trim()).join('\n');
  const status = byId('copy-status');
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('Text only');
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([card.outerHTML], { type: 'text/html' }),
      'text/plain': new Blob([plain], { type: 'text/plain' })
    })]);
  } catch {
    try {
      await navigator.clipboard.writeText(plain);
    } catch {
      const field = byId('manual-copy');
      field.value = plain;
      field.hidden = false;
      field.focus();
      field.select();
      status.textContent = 'Your results are selected below. Choose Copy, then paste them into your response.';
      return;
    }
  }
  byId('manual-copy').hidden = true;
  status.textContent = 'Results copied! Paste them into your email or Toddle response.';
};

byId('download-pdf').onclick = async () => {
  const button = byId('download-pdf');
  const status = byId('pdf-status');
  const completed = report;
  button.disabled = true;
  try {
    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'vendor/jspdf-4.2.1.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
    }
    downloadReport(completed);
    status.textContent = 'Your color PDF is ready.';
  } catch {
    status.textContent = 'The PDF could not be created. Try Download PDF again.';
  } finally {
    status.hidden = false;
    button.disabled = false;
  }
};

function downloadReport(result) {
  const pdf = new window.jspdf.jsPDF();
  pdf.setProperties({ title: 'Grade 5 vocabulary quiz results' });
  function label(value, x, y, size, bold = false) {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.text(value, x, y);
  }
  pdf.setFillColor('#FFD4B8');
  pdf.rect(0, 0, 210, 68, 'F');
  pdf.setTextColor('#683B27');
  label('GRADE 5  /  VOCABULARY QUIZ', 18, 20, 13, true);
  label(result.correct + ' / ' + result.total, 18, 46, 44, true);
  label(result.percent + '% correct', 18, 58, 16);
  pdf.setTextColor('#33261f');
  if (result.studentName) {
    // Render names with the browser's fonts, including scripts outside the PDF's built-in fonts.
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 68;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 46px sans-serif';
    ctx.fillStyle = '#33261f';
    ctx.fillText('Student: ' + result.studentName, 0, 51, canvas.width);
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 18, 69, 174, 7.4);
  }
  label('Date taken', 18, 84, 12, true);
  label(result.date, 18, 92, 14);
  label('Time taken', 118, 84, 12, true);
  label(result.duration, 118, 92, 14);
  label(result.unitNames + '   |   ' + result.timing, 18, 109, 13);
  label('Subject results', 18, 129, 17, true);
  let y = 136;
  for (const subject of result.breakdown) {
    pdf.setFillColor(subject.color);
    pdf.roundedRect(18, y, 174, 14, 2, 2, 'F');
    label(subject.name, 23, y + 9, 13, true);
    label(subject.earned + ' / ' + subject.total, 162, y + 9, 13);
    y += 17;
  }
  y += 12;
  label(result.practice.length ? 'Words to practice' : 'Every word correct!', 18, y, 16, true);
  if (result.practice.length) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    label(pdf.splitTextToSize(result.practice.join(', '), 174), 18, y + 10, 12);
  }
  pdf.save('Vocabulary quiz - ' + result.date.replace(',', '') + '.pdf');
}
