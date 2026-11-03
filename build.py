from pathlib import Path
import json
p=Path(__file__).parent
out=p/'dist'
data=json.loads((p/'vocabulary.json').read_text())
(out/'words.js').write_text('const subjects = '+json.dumps(data,ensure_ascii=False)+';')
for page in ['home',*data]:
 s=data.get(page); name=s['name'] if s else 'Vocabulary'
 nav=''.join(f'<a href="{k}.html" '+('aria-current="page"' if k==page else '')+f'>{v["name"]}</a>' for k,v in data.items())
 quiz_url='quiz.html' if not s else f'quiz.html?subject={page}'
 nav+=f'<a id="quiz-link" href="{quiz_url}">Take a quiz</a>'
 body=f'<a class="skip" href="#main">Skip to vocabulary</a><header><a class="home" href="index.html">⌂ Home</a><nav aria-label="Subjects">{nav}</nav></header><main id="main">'
 if not s:
  body+='<h1>Vocabulary</h1><div class="subjects">'
  for k,v in data.items():body+=f'<a class="subject" style="--color:{v["canvas"]}" href="{k}.html"><img src="{v["titleImage"]}" alt=""><div class="label"><h2>{v["name"]}</h2><span aria-hidden="true">→</span></div></a>'
  body+='</div>'
 else:
  body+=f'<h1 id="heading">{name}</h1><div id="unit-menu" class="units">'
  for n,u in s['units'].items():body+=f'<a class="unit" href="{page}.html?unit={n}"><strong>Unit {n}</strong><span>{u["title"]}</span><b aria-hidden="true">→</b></a>'
  body+=f'<a class="unit all" href="{page}.html?unit=all"><strong>All words</strong><b aria-hidden="true">→</b></a></div><section id="vocabulary" hidden><div class="toolbar"><a class="back" href="{page}.html">← Choose a unit</a><input type="search" id="search" aria-label="Search vocabulary" placeholder="Search words…" autocomplete="off"><span id="count" class="sr-only" role="status"></span></div><div id="words" class="words"></div><p id="empty" hidden>No matching words.</p></section>'
 body+='</main><dialog id="card" aria-label="Vocabulary card"><div class="bar"><button id="close" aria-label="Close vocabulary card">Close ✕</button></div><div id="card-content"></div><p class="note" id="card-note" hidden></p></dialog>'
 theme=f'--paper:{s["canvas"]};--ink:{s["ink"]}' if s else '--paper:#FFD4B8;--ink:#683B27'
 (out/('index.html' if page=='home' else page+'.html')).write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{name} | Grade 5E</title><link rel="stylesheet" href="style.css"></head><body style="{theme}" data-page="{page}">{body}<script src="words.js"></script><script src="app.js"></script></body></html>')
