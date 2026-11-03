const page=document.body.dataset.page;
const subject=subjects[page];
const modal=document.querySelector('#card');
const content=document.querySelector('#card-content');
document.querySelector('#close').onclick=()=>modal.close();
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
function cardContent(word){
 if(word.img){const img=document.createElement('img');img.src=word.img;img.alt=word.word+' vocabulary card';img.loading='lazy';return img;}
 const block=document.createElement('div');block.className='definition';const term=document.createElement('strong');term.textContent=word.word;const definition=document.createElement('p');definition.textContent=word.definition;block.append(term,definition);return block;
}
if(subject){
 const unit=new URLSearchParams(location.search).get('unit');
 if(unit==='all'||subject.units[unit]){
  document.querySelector('#quiz-link').href += '&unit='+encodeURIComponent(unit);
  document.querySelector('#unit-menu').hidden=true;
  document.querySelector('#vocabulary').hidden=false;
  const heading=unit==='all'?subject.name+', All words':'Unit '+unit+', '+subject.units[unit].title;
  document.querySelector('#heading').textContent=heading;document.title=heading+' | Grade 5E';
  const source=unit==='all'?Object.values(subject.units).flatMap(u=>u.words):subject.units[unit].words;
  const unique=[...new Map(source.map(w=>[w.word.toLowerCase(),w])).values()];
  unique.sort((a,b)=>a.word.localeCompare(b.word));
  const grid=document.querySelector('#words');
  const all=unique.map(w=>{
   const button=document.createElement('button');button.className='word';button.setAttribute('aria-label','Enlarge '+w.word+' vocabulary card');button.append(cardContent(w));
   button.onclick=()=>{
    content.replaceChildren(...exploreWord(w));modal.setAttribute('aria-label',w.word+' vocabulary card');
    const note=document.querySelector('#card-note');let text='';
    if(page==='reading'&&unit!=='2'&&w.word==='summary')text='For nonfiction, a summary gives the main idea and key details in your own words.';
    if(page==='writing'&&unit!=='1'&&w.word==='paragraph')text='In narratives, use SPITE to decide when a new paragraph begins.';
    if(page==='writing'&&w.word==='action')text='In a narrative, actions show what a character does.';
    note.textContent=text;note.hidden=!text;modal.showModal();
   };grid.append(button);return {button,w};
  });
  function filter(){const q=document.querySelector('#search').value.trim().toLowerCase();let count=0;all.forEach(({button,w})=>{button.hidden=!w.word.toLowerCase().includes(q);if(!button.hidden)count++});document.querySelector('#count').textContent=count+' words';document.querySelector('#empty').hidden=count>0;}
  document.querySelector('#search').addEventListener('input',filter);filter();
 }
}
