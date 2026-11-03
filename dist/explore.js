// Small, authored visual examples. Reuse drawing primitives, not finished pictures.
const clueBook = (() => {
const mint = '#b9dec9', peach = '#ffcfab', blue = '#bddef2', paper = '#fffaf3', ink = '#343d39';
const xml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rect = (x,y,w,h,c=paper) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}" stroke="#7c827b"/>`;
const txt = (x,y,s,size=17) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="600" font-size="${size}" fill="${ink}">${xml(s)}</text>`;
const line = (x,y,a,b,c=ink) => `<path d="M${x} ${y} L${a} ${b}" stroke="${c}" stroke-width="2" fill="none"/>`;
const circle = (x,y,r,c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#65716a"/>`;
const rep = (n,fn) => Array.from({length:n},(_,i)=>fn(i)).join('');
const metrics = document.createElement('canvas').getContext('2d');
const chip = (x,y,w,s,c=blue,size=17) => {
  metrics.font = '600 ' + size + 'px Arial';
  const fit = Math.min(size, size * (w - 10) / metrics.measureText(s).width);
  return rect(x,y,w,34,c)+txt(x+w/2,y+23,s,fit);
};
const pair = (a,b,sign='→') => chip(5,40,134,a,mint)+txt(170,63,sign,25)+chip(201,40,134,b,peach);
const flow = (a,b,c) => chip(3,40,93,a,mint,14)+txt(109,63,'→')+chip(122,40,96,b,blue,14)+txt(231,63,'→')+chip(244,40,93,c,peach,14);
const rows = (a,b) => chip(15,10,310,a,blue)+txt(170,64,'↓')+chip(15,72,310,b,mint);
const pagePic = (head,body,foot,focus) => rect(28,5,284,104)+rect(40,focus*29+11,260,25,peach)+txt(170,30,head,17)+txt(170,59,body,15)+txt(170,88,foot,15);
const venn = (a,b,mid,l,r) => `<ellipse cx="120" cy="62" rx="79" ry="44" fill="${mint}" stroke="${ink}"/><ellipse cx="220" cy="62" rx="79" ry="44" fill="${blue}" fill-opacity=".68" stroke="${ink}"/>`+txt(95,15,a,14)+txt(245,15,b,14)+txt(94,68,l,14)+txt(170,68,mid,12)+txt(248,68,r,14);
const grid = (nr,nc,paint,size=15) => rep(nr*nc,i=>rect(170-nc*size/2+(i%nc)*size,58-nr*size/2+Math.floor(i/nc)*size,size-1,size-1,paint(i)));
const eq = (left,focus,right) => {
  const label=left+focus+right, unit=Math.min(15,300/(label.length+1)), x=170-label.length*unit/2;
  return rect(x+left.length*unit-3,35,focus.length*unit+6,39,peach)+
    `<text x="${x}" y="62" font-family="monospace" font-size="${unit*1.55}" textLength="${label.length*unit}" lengthAdjust="spacingAndGlyphs" fill="${ink}">${xml(label)}</text>`;
};
const numberLine = (labels,mark) => line(31,57,309,57)+labels.map((s,i)=>{
  const x=31+i*278/(labels.length-1);
  return line(x,49,x,65)+(i===mark?circle(x,57,6,peach):'')+txt(x,89,s,15);
}).join('');
const bars = (nums,names) => nums.map((n,i)=>txt(46,26+i*33,names[i],14)+rect(82,9+i*33,n*15,23,[mint,blue,peach][i])+txt(100+n*15,26+i*33,n,14)).join('');
const symbols = (n,x,y) => rep(n,i=>circle(x+i*17,y,6,blue));
return {
'non-fiction text':[pagePic('River crossing records','1905 • bridge opened','Source: town register',2),'Where could a reader check this claim?'],
'historical event':[chip(40,14,80,'1905',peach)+line(82,50,82,86)+chip(110,64,208,'Town bridge opens',mint),'One dated change affected how people traveled.'],
'text features':[rect(48,6,244,99)+chip(57,12,225,'Crossing the river',blue)+rect(59,52,70,43,mint)+line(145,56,271,56)+line(145,68,254,68)+txt(202,91,'see page 8',13),'Which parts help you find information before reading every sentence?'],
'heading':[pagePic('After the bridge opened','People could cross all year.','Fewer travelers needed boats.',0),'Which line tells you what this section will cover?'],
'time line':[numberLine(['1890','1895','1900','1905'],3)+txt(170,27,'Ferry opens                         Bridge opens',14),'Equal spaces stand for equal stretches of time.'],
'caption':[rect(83,6,174,68,blue)+line(94,55,246,55)+line(113,42,113,67)+line(228,42,228,67)+chip(32,78,276,'Opening day at the river, 1905',peach,14),'What does the line below the picture add?'],
'map':[rect(28,3,284,106,mint)+line(175,5,145,110,blue)+line(90,67,253,38)+circle(90,67,5,peach)+circle(253,38,5,peach)+txt(84,89,'Town')+txt(250,27,'Market')+txt(290,90,'↑ N',13),'Trace a route between the two places.'],
'glossary':[pagePic('D · E · F · G','ferry: a boat for crossing water','ford: a shallow crossing',1),'Look up the unfamiliar word by its first letter.'],
'diagram':[line(53,57,284,57)+rect(89,59,13,41,peach)+rect(237,59,13,41,peach)+line(171,31,171,55)+txt(171,23,'deck')+line(103,82,142,82)+txt(165,88,'pier'),'Follow each label to the part it explains.'],
'topic':[chip(100,8,140,'River crossings',mint)+line(170,42,91,66)+line(170,42,249,66)+chip(38,69,105,'ferries')+chip(196,69,105,'bridges'),'What broad subject includes both examples?'],
'main idea':[pagePic('Travel in town changed.','First, people used a ferry.','Later, people used a bridge.',0),'Which statement covers both of the other lines?'],
'key details':[chip(67,4,206,'Travel changed',mint)+line(170,39,86,66)+line(170,39,255,66)+chip(6,69,155,'Ferry closed',peach)+chip(179,69,155,'Bridge opened',peach),'Which two pieces support the claim above them?'],
'summary':[rows('Ferry opens → bridge opens → ferry closes','Travel shifted from ferry to bridge.'),'Three events become one short account.'],
'text structure':[flow('Obstacle','Response','Result'),'Notice how the parts of the passage are arranged.'],
'description':[rect(115,47,110,13,peach)+rect(135,61,9,33,blue)+rect(197,61,9,33,blue)+txt(170,26,'narrow deck')+line(170,31,170,46)+txt(69,87,'stone piers')+line(111,83,134,75),'Which features help you picture this crossing?'],
'chronological order':[venn('Earlier →','→ Later','town','1890','1905'),'Read left to right. The same town gets a ferry first and a bridge later.'],
'sequence of events':[flow('Grip rail','Test plank','Step across'),'What happened first, next, and last?'],
'problem and solution':[pair('Wind stops ferry','Build a bridge'),'What difficulty does the second action address?'],
'compare and contrast':[venn('Ferry','Bridge','cross river','moves','stays put'),'The middle belongs to both crossings. Each outer space belongs to just one.'],
'cause and effect':[venn('Why? →','→ What changed?','road','rain falls','puddles form'),'Follow the arrow: falling rain collects on the road and makes puddles.'],
'text evidence':[pagePic('Claim: Mina is cautious.','“She tested it with one foot.”','Which words support the claim?',1),'Point to the exact words that support the reader’s thinking.'],
'fact':[pair('Opened in 1905','Register: 1905','✓'),'Could another reader check the statement against the record?'],
'opinion':[pair('Best crossing!','Too crowded!','↔'),'Two travelers judge the same place differently.'],
'fiction':[pagePic('The Moon Ferry','A fox rowed between two stars.','A story by Lian',1),'The writer imagined a world where this could happen.'],
'characters':[circle(105,39,17,peach)+rect(84,57,42,35,blue)+circle(225,45,13,peach)+rect(209,60,32,32,mint)+txt(105,108,'Mina',14)+txt(225,108,'Bo',14),'Who takes part in the scene?'],
'setting':[pair('At the river','Before sunrise','+'),'Place and time together locate the scene.'],
'events':[flow('Bo slips','Mina grabs him','Bo stands'),'Which things actually happen in this scene?'],
'character trait':[rows('Monday: checks rope   •   Friday: checks rail','What quality keeps showing up?'),'Look for a pattern across more than one moment.'],
'major character':[flow('Mina decides','Mina acts','Town changes'),'Whose choices move the story forward?'],
'minor characters':[pair('Guard lends key','Mina continues'),'One figure helps the main figure along, then leaves the story.'],
'quote':[rows('Mina said: Wait here.','In my notes: “Wait here.”'),'Which words were carried over exactly?'],
'quotation marks':[txt(70,78,'“',62)+txt(168,65,'Wait here.',28)+txt(269,78,'”',62),'Which two marks frame the spoken words?'],
'compare':[venn('Mina','Bo','check rail','walks','runs'),'Focus on the action both travelers take.'],
'contrast':[venn('Mina','Bo','cross','checks first','rushes'),'Look at the outer spaces. How do their choices differ?'],
'similar':[circle(110,60,31,mint)+circle(225,60,21,mint)+txt(167,107,'Both round and green',15),'They share features even though their sizes differ.'],
'different':[rect(73,35,48,48,blue)+circle(226,59,24,blue)+txt(169,107,'Corners?                  Curves?',14),'Keep the color the same. What changes?'],
'motivation':[pair('Keep Bo safe','Test the plank'),'Read from the reason to the choice it explains.'],
'infer':[null,'A wet umbrella leans by the door. Damp shoeprints lead inside. What probably happened outside?'],
'emotion':[circle(166,53,36,peach)+circle(154,45,3,ink)+circle(179,45,3,ink)+'<path d="M151 64 Q166 49 182 64" fill="none" stroke="#343d39" stroke-width="3"/>'+txt(166,106,'Just before the first step…',15),'What feeling might this face show right now?'],
'challenge':[chip(7,43,89,'Mina')+rect(133,20,51,77,peach)+txt(158,66,'gap',14)+chip(231,43,100,'Far bank',mint),'What stands between the traveler and her goal?'],
'experience':[pair('Last winter: slip','Today: hold rail'),'Something Mina lived through shapes her next choice.'],
'text to self connection':[pair('Mina tests plank','I test my chair','↔'),'How does a moment in the story connect with your own life?'],
'point of view':[rows('Mina: “I felt the plank shake.”','Bo: “I saw her stop.”'),'The same moment changes with the storyteller.'],
'interpretation of character':[pair('Tests the plank','Brave or careful?'),'How might two readers explain the same choice?'],
'plot':[flow('Plank cracks','Bo falls','Mina rescues'),'One event sets the next in motion.'],
'problem':[pair('Need to cross','Bridge is broken','×'),'Put the goal beside the obstacle. Why can’t the traveler continue?'],
'resolution':[flow('Bo is stranded','Mina helps','Both are safe'),'Which part settles the conflict?'],
'mood':[null,'A loose plank interrupts the crossing, and fog hides the far bank. How does the scene make you feel?'],
'comprehension':[pair('Plank is loose','Bo waits','∴'),'Can you explain why the second event follows the first?'],
'retell':[flow('She noticed…','Then she tried…','Finally she…'),'Use the three moments to tell the story again.'],
'informational writing':[pagePic('How bridges hold weight','Deck → piers → ground','Follow the load downward.',1),'The writer uses a model to teach how something works.'],
'details':[pair('Sound: click','Touch: splinters','+'),'What can the reader now hear and feel?'],
'title':[rect(96,4,148,104,blue)+line(111,5,111,107)+txt(177,54,'One Step',21)+txt(177,80,'Across',21),'These words name the entire book.'],
'paragraph':[rect(50,4,240,105)+rep(3,i=>line(i?65:85,19+i*10,263,19+i*10))+rep(4,i=>line(i?65:85,63+i*10,255,63+i*10))+line(40,56,40,98,peach),'Notice the fresh start when the writing moves to a new idea.'],
'topic sentence':[pagePic('Crossings need strong supports.','Piers carry the deck.','Foundations carry the piers.',0),'Which line introduces what this paragraph explains?'],
'conclusion':[pagePic('The deck carries travelers.','Piers support the deck.','Together they carry the load.',2),'The final line brings the explanation back together.'],
'linking words':[chip(8,41,107,'It creaked')+chip(127,41,75,'so',peach)+chip(215,41,118,'I stopped'),'The small middle word shows how the ideas fit.'],
'draft':[pagePic('Version 1','The bridge was scary.','[Add what I heard here.]',2),'There is an idea on the page and room to develop it.'],
'revise':[rows('The crossing was scary.','The boards rattled beneath my feet.'),'What new detail changes the reader’s experience?'],
'audience':[pair('New reader','Bridge builder','↔'),'Who needs “pier” explained, and who might want its measurements?'],
'narrative writing':[flow('I set off','A board broke','I leaped'),'Follow one person through a connected experience.'],
'author':[chip(34,32,125,'Lian writes',peach)+line(161,48,199,72)+rect(201,31,90,68,blue)+txt(246,69,'A story',17),'Who created the story that appears on the page?'],
'story structure':[line(30,85,167,22)+line(167,22,307,84)+txt(51,105,'Opening',14)+txt(166,17,'Turning point',14)+txt(282,105,'Ending',14),'Trace how the whole narrative is organized.'],
'chapter':[rect(36,9,267,98)+txt(170,32,'IV',19)+txt(170,59,'The Next Morning',20)+line(71,76,271,76)+line(71,87,235,87),'A numbered break begins a new section of the book.'],
'dialogue':[chip(13,12,194,'“Hold the rail!”',blue)+line(42,47,26,60)+chip(134,69,191,'“I have it.”',mint)+line(289,68,307,55),'Follow the exchange from one speaker to the other.'],
'action':[flow('Reach','Grab','Pull'),'These verbs let you see what Mina does.'],
'figurative language':[pair('Boards groaned','A tired voice','≈'),'Wood cannot speak. What does the comparison let you hear?'],
'simile':[chip(6,42,96,'plank')+chip(117,42,78,'like',peach)+chip(210,42,124,'a spring'),'Look for the word connecting the two things.'],
'metaphor':[rows('The bridge was a drum.','Footsteps → a hollow, booming sound'),'What shared quality makes this comparison work?'],
'hook':[pagePic('Halfway across, a board snapped.','What happens next?','Turn the page →',0),'Which opening makes you want to read on?'],
'edit':[rows('the boards clicks','The boards click.'),'Find the capital letter and the change that makes the verb fit.'],
'descriptive words':[flow('rough wood','sharp click','cold rail'),'Which details bring your senses into the scene?'],
'adjective':[chip(65,41,96,'loose',peach)+txt(178,66,'→')+chip(199,41,96,'plank',mint),'Which word tells what the object is like?'],
'tone':[rows('“Oh, wonderful. Another broken plank.”','“Please stay off the broken plank.”'),'Listen for the speaker’s attitude in each line.'],
'Place Value':[chip(24,15,90,'100')+chip(125,15,90,'10')+chip(226,15,90,'1')+txt(69,86,'3')+txt(170,86,'4')+txt(271,86,'2'),'Slide the 4 one column left. How would its amount change?'],
'Digit':[eq('8','5','2')+txt(170,100,'one symbol out of ten',15),'Look at the single highlighted symbol.'],
'Value':[pair('5 in 54','50'),'Both boxes refer to the same 5. How much does it contribute?'],
'Power of Ten':[flow('1','10','100')+txt(108,30,'× 10',14)+txt(232,30,'× 10',14),'Each step uses another factor of ten.'],
'Decimal':[eq('34','.','25')+txt(170,101,'whole part    |    fractional part',15),'Which mark separates whole amounts from smaller parts?'],
'Tenths (Decimal Place Value)':[grid(1,10,i=>i<2?blue:paper,26),'A strip is split into ten equal pieces. Two are shaded.'],
'Hundredths':[grid(10,10,i=>i<5?peach:paper,10),'Five small squares are shaded out of one hundred.'],
'Thousandths':[flow('1 whole','1/100','1/1000')+txt(231,26,'÷ 10',15),'Split one hundredth into ten equal pieces. How large is one piece?'],
'Whole Number':[numberLine(['0','1','2','3','4'],3),'Count complete jumps from zero. Stop at a counting mark.'],
'Standard Form':[pair('3 hundreds + 2','302'),'Notice how the zero holds the empty tens place.'],
'Word Form':[rows('342','three hundred forty-two'),'How would the number sound when read aloud?'],
'Expanded Form':[rows('342','300    +    40    +    2'),'Separate each contribution before adding.'],
'Unit Form':[rows('342','3 hundreds   4 tens   2 ones'),'Each count is paired with the size of its group.'],
'Compare':[rows('34.250','34.205')+line(185,12,185,103,'#9c6138'),'Align the points. Which is the first place where the digits differ?'],
'Greater Than':[symbols(5,26,60)+txt(166,72,'>',36)+symbols(2,231,60),'The open end faces the larger collection.'],
'Less Than':[symbols(2,68,60)+txt(166,72,'<',36)+symbols(5,215,60),'The pointed end faces the smaller collection.'],
'Equal':[eq('0.50 ','=',' 0.5'),'Adding a final zero changes the notation. Does it change the amount?'],
'Rounding':[numberLine(['30','32','34','36','38','40'],2)+txt(170,26,'34 is closer to which ten?',15),'Compare distances to the two endpoints.'],
'Number Line':[numberLine(['0','¼','½','¾','1'],2),'Every gap stands for the same jump.'],
'Multiply':[flow('6','12','24')+txt(107,30,'× 2',14)+txt(230,30,'× 2',14),'Double twice to find four groups of six.'],
'Division':[symbols(6,126,21)+line(170,31,98,59)+line(170,31,243,59)+symbols(3,79,78)+symbols(3,225,78),'Share six counters fairly between two people.'],
'Quotient':[eq('24 ÷ 6 = ','4','')+txt(170,103,'boxes filled',15),'Six tiles fit in a box. What does the highlighted result count?'],
'Addend':[eq('','30',' + 12 = 42'),'Identify one amount being joined to another.'],
'Sum':[eq('30 + 12 = ','42',''),'Which number counts the entire collection?'],
'Regroup':[rep(3,i=>rect(35+i*14,29,11,52,blue))+txt(103,62,'→')+rep(2,i=>rect(133+i*14,29,11,52,blue))+rep(10,i=>rect(203+i%5*14,40+Math.floor(i/5)*15,12,12,peach)),'Three tens become two tens and ten ones. What stayed constant?'],
'Minuend':[eq('','42',' − 17 = 25')+txt(170,100,'Where did we start?',15),'Find the amount in the collection before anything was removed.'],
'Subtrahend':[eq('42 − ','17',' = 25')+txt(170,100,'What was taken away?',15),'Which quantity leaves the original collection?'],
'Difference':[numberLine(['17','22','27','32','37','42'],-1)+txt(170,23,'←  distance between the ends  →',15),'Count up from 17 to 42. How far apart are they?'],
'Data':[pagePic('How did you travel?','Bo: bike      Mina: bus','Lee: walk      Kai: bike',1),'What information did the students supply?'],
'Record':[rows('One more rider answers “bus.”','Bus:   III   →   IIII'),'The observer adds a mark as each answer arrives.'],
'Units':[pair('5 cm','5 m','≠'),'The number stays the same. What changes its size?'],
'Second':[circle(165,56,40,paper)+rep(12,i=>{const a=i*Math.PI/6;return line(165+Math.sin(a)*33,56-Math.cos(a)*33,165+Math.sin(a)*39,56-Math.cos(a)*39)})+line(165,56,165,24)+line(165,56,184,28, '#b75e37')+txt(270,66,'1/60 min',15),'One full turn of the long ticking hand takes a minute. Think of one tick.'],
'Equation':[eq('4 × 6 ','=',' 20 + 4'),'Check the amount on each side of the middle sign.'],
'Multiplication':[grid(3,5,i=>[blue,mint,peach][Math.floor(i/5)],21)+txt(170,108,'5 + 5 + 5',16),'Three equally long rows each contribute five tiles.'],
'Factor':[eq('','4 × 6',' = 24'),'Which two numbers determine the dimensions of the rectangle?'],
'Product':[eq('4 × 6 = ','24',''),'Which number counts all the tiles after the groups are combined?'],
'Equal Group':[rep(3,i=>rect(9+i*111,31,97,49,i===0?mint:paper)+symbols(3,37+i*111,56)),'Look inside each box. What must be true about every count?'],
'Array':[grid(4,6,()=>blue,20),'Trace four horizontal lines and six vertical lines of tiles.'],
'Area Model':[rect(57,25,152,68,mint)+rect(209,25,75,68,peach)+txt(132,19,'4')+txt(247,19,'2')+txt(42,66,'3')+txt(133,66,'12')+txt(245,66,'6'),'The width splits into 4 and 2. Both regions have the same height.'],
'Strategies':[rows('4 × 6 → double 6 twice','4 × 6 → (4 × 5) + 4'),'Two routes reach the same total. Which would you choose?'],
'Multiple':[numberLine(['0','6','12','18','24'],3)+txt(170,22,'+6       +6       +6       +6',15),'Follow equal jumps of six. Which numbers can you land on?'],
'Zero Property':[eq('6 × ','0',' = 0')+txt(170,101,'no groups to count',15),'What happens to the total when all the groups are removed?'],
'Identity Property (Multiplication)':[eq('6 × ','1',' = 6')+symbols(6,127,95),'A single group keeps all six counters.'],
'Distributive Property':[rows('4 × (5 + 1)','(4 × 5) + (4 × 1)'),'The four acts on both parts inside the parentheses.'],
'Partial Products':[grid(4,6,i=>i%6<4?blue:peach,16)+txt(170,108,'16 tiles   +   8 tiles',15),'The two colored pieces each supply part of the total.'],
'Algorithm':[flow('3 × 4 = 12','Carry 1 ten','6 tens + 1')+txt(170,23,'24 × 3',19)+txt(170,101,'7 tens and 2 ones',15),'Follow the ordered calculation, including the carried ten.'],
'Row':[grid(4,6,i=>i>=6&&i<12?peach:paper,18),'Follow just the highlighted strip from left to right.'],
'Dividend':[eq('','24',' ÷ 6 = 4')+txt(170,101,'all tiles before packing',15),'Which number is the starting amount to be shared?'],
'Divisor':[eq('24 ÷ ','6',' = 4')+txt(170,101,'tiles per box',15),'Which number sets the size of each pack?'],
'Remainder':[rep(3,i=>rect(9+i*81,33,72,43,mint)+symbols(3,27+i*81,54))+symbols(2,282,54)+txt(285,95,'left over',14),'After making full packs of three, look outside the boxes.'],
'Inverse Operation':[rows('4 × 6 = 24','24 ÷ 6 = 4'),'The second calculation takes you back to the starting factor.'],
'Partial Quotients':[rows('96 − 60 − 36 = 0','10 groups + 6 groups = 16'),'Remove chunks of six, then combine the group counts.'],
'Subtraction':[symbols(7,115,50)+rep(3,i=>line(179+i*17,40,189+i*17,60,'#a13d32'))+txt(170,93,'7 − 3',18),'Cross out three dots. How many remain?'],
'Compatible Numbers':[pair('98 ÷ 6','96 ÷ 6','≈'),'Choose a nearby amount that splits evenly into sixes.'],
'Interpret':[pair('Bus 12; bike 4','8 more by bus'),'Turn the counts into a statement about the travelers.'],
'Range':[numberLine(['4','6','8','10','12'],-1)+txt(170,23,'12 − 4 = 8',19),'Use the smallest and largest counts to measure their spread.'],
'Bar Graph':[bars([8,12,4],['Walk','Bus','Bike']),'All three bars begin at the same point. Compare their lengths.'],
'Scale':[numberLine(['0','4','8','12','16'],1)+txt(170,21,'one interval = 4 riders',15),'How much does each space represent?'],
'Picture Graph':[txt(67,39,'Walk')+symbols(4,132,33)+txt(67,75,'Bike')+symbols(2,132,69)+txt(242,106,'● = 2 people',14),'Count the symbols and use the key to find the number of people.'],
'Key':[circle(94,56,11,blue)+txt(184,62,'= 2 riders',22),'Use this little guide to read every symbol in the display.'],
'Graph':[line(64,14,64,92)+line(64,92,286,92)+line(75,77,154,55)+line(154,55,256,26)+[ [75,77],[154,55],[256,26] ].map(([x,y])=>circle(x,y,5,blue)).join('')+txt(168,109,'Mon             Tue             Wed',13),'The plotted points reveal how the count changes over days.'],
'Table':[rep(3,i=>rect(52,8+33*i,128,32,i?paper:blue)+rect(180,8+33*i,103,32,i?paper:blue)+txt(116,30+33*i,['Travel','Bus','Bike'][i],15)+txt(231,30+33*i,['Students','12','4'][i],15)),'Read across a single line to match a category with its count.'],
'Accuracy':[pair('Counted: 25','Roster: 24','≠'),'Check a measurement against a trusted count. Was someone counted twice?'],
'Represent':[symbols(4,43,56)+txt(145,64,'→',22)+chip(182,39,123,'2 + 2',mint),'Turn the collection into an expression that preserves its amount.'],
'Problem Solving':[flow('24 riders','2 per cart','? carts'),'Which calculation would tell you how many carts to prepare?'],
'Reasoning and Proof':[rows('Claim: bus = walk and bike together','Check: 12 = 8 + 4   ✓'),'The second line gives evidence for the first.'],
'Communication':[rows('“Bus is more.”','“Four more took the bus than walked.”'),'Which explanation lets another student check what you mean?'],
'Connections':[pair('12 of 24','½ the class','↔'),'How does a survey count connect to a fraction?'],
'Representation':[rect(70,27,96,60,blue)+rect(166,27,96,60,paper)+txt(167,106,'12 of 24 students',15),'The part shaded in the model stands for half of the class.']
};
})();
function exhibitArt(term) {
  if (term === 'mood' || term === 'infer') {
    return `<img src="assets/clues/${term}.jpg" alt="" class="scene-clue">`;
  }
  return `<svg viewBox="0 0 340 116" aria-hidden="true">${clueBook[term][0]}</svg>`;
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
  model.innerHTML = exhibitArt(word.word);
  model.append(element('figcaption',clueBook[word.word][1]));
  right.append(model,element('h3',title),element('p',example),element('p',reason));
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
