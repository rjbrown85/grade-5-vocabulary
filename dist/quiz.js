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
  showQuestion();
};
function showQuestion() {
  const q = questions[current];
  const chooseWord = q.mode === 'word';
  byId('progress').textContent = q.subject + ' · Question ' + (current + 1) + ' of ' + questions.length;
  byId('instruction').textContent = chooseWord ? 'Which word matches this definition?' : 'What does this word mean?';
  byId('prompt').textContent = chooseWord ? definitions[q.term] : q.term;
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
  [...byId('answers').children].forEach((button, i) => {
    button.disabled = true;
    if (q.choices[i] === q.term) button.classList.add('correct');
    else if (q.choices[i] === choice) button.classList.add('wrong');
  });
  const fact = q.term + ' — ' + definitions[q.term];
  byId('feedback').textContent = choice === q.term ? 'Correct!' : (choice === null ? 'Time is up. ' : 'Correct answer: ') + fact;
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
