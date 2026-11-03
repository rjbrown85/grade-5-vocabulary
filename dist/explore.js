// The diagrams illustrate the shared situation; each word has its own interpretation.
function exhibitArt(group) {
  const rect = (x,y,w,h,fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}"/>`;
  const text = (x,y,value,size=15) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-family="Arial,sans-serif" font-weight="bold" fill="#30362d">${value}</text>`;
  const repeat = (count, draw) => Array.from({length: count}, (_, i) => draw(i)).join('');
  const mint = '#9bcbb0', peach = '#ffca9a', blue = '#a5cdef';
  let shapes;
  switch (group) {
    case 'array':
      shapes = repeat(24,i=>rect(84+i%6*29,8+Math.floor(i/6)*23,25,20,i%6<3?mint:blue));
      break;
    case 'places':
      shapes = ['Tens','Ones','Tenths','Hundredths','Thousandths'].map((v,i)=>rect(4+i*67,19,64,66,i<2?peach:blue)+text(36+i*67,43,v,10)+text(36+i*67,73,'34250'[i],25)).join('');
      break;
    case 'data':
      shapes = ['Walk','Bus','Bike'].map((v,i)=>text(40,24+i*33,v)+rect(78,9+i*33,[144,216,72][i],21,[mint,peach,blue][i])+text([235,307,163][i],25+i*33,[8,12,4][i])).join('');
      break;
    case 'trade':
      shapes = repeat(4,i=>rect(25+i*11,26,8,51,blue))+repeat(2,i=>rect(77+i*10,67,8,10,peach))+text(141,59,'=')+repeat(3,i=>rect(177+i*11,26,8,51,blue))+repeat(12,i=>rect(227+(i%6)*12,53+Math.floor(i/6)*14,9,10,peach));
      break;
    case 'archive':
      shapes = '<path d="M26 55 H315" stroke="#687763" stroke-width="4"/>'+[30,270,286].map(x=>rect(x,46,7,18,mint)).join('')+text(33,32,'1890')+text(261,32,'1905')+text(295,88,'1906');
      break;
    case 'story': case 'workshop':
      shapes = '<path d="M0 85 Q65 67 120 84 T240 82 T340 80 V105 H0Z" fill="#a6d5e6"/><path d="M16 53 Q170 72 324 52" fill="none" stroke="#60412b" stroke-width="5"/>'+repeat(10,i=>rect(20+i*30,i===5?47:53,27,12,i===5?peach:'#c3a37f'))+rect(38,28,8,46,'#765a42')+rect(292,28,8,46,'#765a42')+'<path d="M42 29 Q168 53 296 29" fill="none" stroke="#765a42" stroke-width="3"/>';
      break;
  }
  return `<svg viewBox="0 0 340 105" aria-hidden="true">${shapes}</svg>`;
}
function exploreWord(word) {
  const element = (tag, value) => {
    const node = document.createElement(tag);
    node.textContent = value;
    return node;
  };
  const left = document.createElement('section');
  left.className = 'word-reference';
  left.append(element('h2',word.word),cardContent(word),element('p',definitions[word.word]));
  const [group, reason] = lessons[word.word];
  const [title, example, question] = exhibits[group];
  const right = document.createElement('section');
  right.className = 'word-lab';
  const model = document.createElement('figure');
  model.innerHTML = exhibitArt(group);
  model.append(element('figcaption',example));
  right.append(element('h3',title),model,element('p',reason));
  if (['Algorithm','Equation','Strategies'].includes(word.word)) {
    const extra = document.createElement('details');
    extra.append(element('summary','Try it: order of operations'));
    const paths = document.createElement('div');
    paths.className = 'operation-paths';
    for (const steps of [
      ['4 + 3 × 2', 'Multiply 3 × 2 first.', '4 + 6 = 10'],
      ['(4 + 3) × 2', 'Add inside the parentheses first.', '7 × 2 = 14']
    ]) {
      const path = document.createElement('div');
      path.append(element('strong',steps[0]),element('p',steps[1]),element('b',steps[2]));
      paths.append(path);
    }
    extra.append(paths,element('p','The numbers stay the same. The parentheses change which numbers form a group before you multiply.'));
    right.append(extra);
  }
  right.append(element('h4','Think it through'),element('p',question));
  return [left,right];
}
