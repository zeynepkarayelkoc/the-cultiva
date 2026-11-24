// İlk İngilizce testler (Kasım 2026). thecultiva.com/admin açıkken konsolda çalıştırılır.
const S=(text,hint,explanation,opts,d)=>({text,hint,explanation,options:opts.map((t,i)=>({text:t,is_correct:i===d}))});
const R=(a,b,c,e)=>[
 {min_correct:10,title:a[0],description:a[1],color:'#8b2635'},
 {min_correct:7,title:b[0],description:b[1],color:'#b5734a'},
 {min_correct:4,title:c[0],description:c[1],color:'#9a6b1f'},
 {min_correct:0,title:e[0],description:e[1],color:'#7d7264'}];
const K=(text,hint,pairs)=>({text,hint,options:pairs.map(([t,k])=>({text:t,outcome_key:k}))});

const TESTLER=[
{title:'Art Symbolism Quiz: Can You Read a Painting?',lang:'en',type:'bilgi',category:'sanat',published:true,
 description:'Skulls, candles, pomegranates and hidden faces. Ten questions on the symbols painters used to tell you more than they showed.',
 questions:[
  S('In a vanitas still life, what does a candle that has just gone out usually stand for?','Look at the smoke','A snuffed or smoking candle is one of the classic signs of a life that has ended. It sits beside skulls and hourglasses in many Dutch still lifes.',['Prayer and devotion','A life that has ended','A wealthy household','A secret love affair'],1),
  S('What does the Latin phrase "memento mori" mean?','Not as cheerful as carpe diem','Memento mori means "remember that you must die". It is the broad theme behind countless skulls in art.',['Seize the day','Vanity of vanities','Remember that you must die','Death conquers all'],2),
  S('Holbein\'s The Ambassadors (1533) hides which object across the floor?','Look at it from the side','A stretched, distorted skull runs across the floor. Seen from the right-hand side, it snaps into shape.',['A distorted skull','A broken lute string','A hidden dagger','A tiny hourglass'],0),
  S('Soap bubbles in Dutch paintings recall which Latin saying?','Fragile and brief','"Homo bulla", man is a bubble: life is as fragile and short as a soap bubble.',['Tempus fugit','Ars longa, vita brevis','Carpe diem','Homo bulla'],3),
  S('What did Persephone eat in the underworld that bound her to return every year?','Red, and full of seeds','She ate pomegranate seeds. In art the pomegranate in her hand marks her double life between two worlds.',['Pomegranate seeds','Figs','Grapes','A golden apple'],0),
  S('Which costly flower stands for life in Philippe de Champaigne\'s Still Life with a Skull?','Think of 17th-century Holland','A tulip, then a famously expensive luxury, stands for life beside the skull (death) and the hourglass (time).',['Rose','Lily','Tulip','Iris'],2),
  S('In Botticelli\'s Madonna of the Pomegranate, what does the fruit foreshadow?','Red juice, many seeds','The pomegranate points to Christ\'s Passion and Resurrection, a common meaning in Christian art.',['A royal marriage','The Passion and Resurrection','A good harvest','The Baptism'],1),
  S('The word "vanitas" comes from which book of the Bible?','"Vanity of vanities, all is vanity"','It comes from the opening of Ecclesiastes in the Latin Vulgate: vanitas vanitatum, omnia vanitas.',['Genesis','Psalms','Revelation','Ecclesiastes'],3),
  S('An hourglass in a painting most often means what?','Sand running down','Time running out. It is one of the symbols shared by vanitas and memento mori images.',['Patience','Time running out','A long journey','Hidden wealth'],1),
  S('In Osman Hamdi Bey\'s The Tortoise Trainer, what does the old man hold?','A Sufi instrument','He holds a ney, the reed flute of Sufi music, as if to teach the tortoises to move to music.',['A ney (reed flute)','An oud','A violin','A tambourine'],0),
 ],
 outcomes:R(['Master Iconographer','A perfect score. You read paintings the way other people read street signs. Museums should hire you as a guide.'],['Sharp-Eyed Curator','You spot most of the hidden messages. A couple slipped past, but you clearly know where to look.'],['Gallery Wanderer','You know the famous symbols and can tell a skull from a still life. A few more museum visits and you will be reading the details too.'],['First Visit to the Museum','Every expert started here. Our guides to vanitas, Persephone and the pomegranate will have you decoding paintings in no time.'])},

{title:'Art Terms Quiz: Chiaroscuro, Sfumato and More',lang:'en',type:'bilgi',category:'sanat',published:true,
 description:'Chiaroscuro or tenebrism? Mannerism or Renaissance? Ten questions on the words art historians love and everyone else mixes up.',
 questions:[
  S('Which technique blends tones so softly that no edges are visible?','Italian for "like smoke"','Sfumato, from the Italian fumo, smoke. Leonardo used it to dissolve the edges of eyes and mouths.',['Impasto','Tenebrism','Sfumato','Pointillism'],2),
  S('Which painter is most associated with tenebrism?','Spotlight in a dark room','Caravaggio. His sharp beams of light in near-total darkness spread across Europe through his followers.',['Raphael','Caravaggio','Botticelli','Vermeer'],1),
  S('Chiaroscuro joins two Italian words. What do they mean?','The name says it all','Chiaro means light and scuro means dark. The technique uses graded light and shadow to model form.',['Light and dark','Smoke and fire','Colour and line','Paint and plaster'],0),
  S('Which painting is the classic example of sfumato?','Her smile is famous','The Mona Lisa. The soft transitions around her eyes and mouth make her expression seem to shift.',['The Night Watch','The Calling of Saint Matthew','The School of Athens','Mona Lisa'],3),
  S('The term Mannerism comes from the Italian maniera. What does it mean?','Vasari meant it as praise','Maniera means style or manner. Vasari used it for the grace and sophistication of artists after Raphael.',['Style or manner','Distortion','Hand','Mask'],0),
  S('Parmigianino\'s famous Madonna is known for her unusually long what?','It is in the painting\'s nickname','Her neck. The Madonna with the Long Neck (1534-40) is one of the defining Mannerist paintings.',['Veil','Neck','Cloak','Shadow'],1),
  S('Which city was sacked in 1527, an event often linked to the end of the High Renaissance?','Home of the popes','Rome was sacked by imperial troops in 1527, scattering artists and patrons.',['Florence','Venice','Rome','Milan'],2),
  S('What is the spiralling pose of Mannerist sculpture called?','A snake-like twist','Figura serpentinata, the "serpentine figure". Contrapposto is a real term too, but it describes a relaxed standing pose.',['Contrapposto','Putto','Sfumato','Figura serpentinata'],3),
  S('What is buon fresco?','Speed matters','Painting on wet lime plaster, so the colour binds into the wall as it dries.',['Painting on wet lime plaster','Painting with egg yolk','Painting with hot wax','Painting on dry wood'],0),
  S('Gerrit van Honthorst was nicknamed in Italy for his night scenes. What was the nickname?','Gerard of the...','Gherardo delle Notti, "Gerard of the Nights". Lo Spagnoletto was Ribera\'s nickname.',['Il Divino','Lo Spagnoletto','Gherardo delle Notti','Il Guercino'],2),
 ],
 outcomes:R(['Studio Master','Ten out of ten. You could teach this course, and possibly correct the textbook.'],['Art History Graduate','You know your sfumato from your tenebrism. Just a couple of terms to polish.'],['Curious Apprentice','You have the basics and a good eye. Our guides to chiaroscuro and Mannerism will fill in the rest.'],['Blank Canvas','No shame, these words confuse almost everyone. Start with our chiaroscuro vs tenebrism guide and try again.'])},

{title:'Which Art Movement Are You?',lang:'en',type:'kisilik',category:'sanat',published:true,
 description:'Eight everyday questions, four art movements. Are you balanced Renaissance, dramatic Baroque, spontaneous Impressionism or dreamy Surrealism?',
 questions:[
  K('Your ideal Saturday morning?','No wrong answers',[['Reorganising the bookshelf, by author and by colour','ren'],['Sleeping in to finish a very strange dream','sur'],['A walk by the water, coffee in hand, watching the light change','imp'],['A brunch that turns into a three-hour debate about everything','bar']]),
  K('How do you behave in the group chat?','Be honest',[['Fourteen voice notes in a row','bar'],['A blurry sunset photo, no caption','imp'],['A perfectly worded paragraph','ren'],['A cryptic meme nobody quite understands','sur']]),
  K('Pick a room to spend an afternoon in.','Close your eyes and choose',[['A bright studio full of plants','imp'],['A staircase that leads to a door in the ceiling','sur'],['A candlelit library with velvet curtains','bar'],['A symmetrical courtyard with a fountain','ren']]),
  K('A friend forgets your birthday. What happens next?','We have all been there',[['You forgive them, then plan next year\'s party yourself','ren'],['You hadn\'t noticed either. The days blur nicely','imp'],['You mention it, dramatically, at every dinner for a year','bar'],['You send them a cake shaped like a melting clock','sur']]),
  K('Choose a trip.','Bags are packed',[['Rome, for the churches, the opera and the drama','bar'],['Florence, with a printed itinerary','ren'],['Somewhere you once saw in a dream','sur'],['A seaside village in Normandy','imp']]),
  K('How do you get work done?','Deadlines included',[['Quickly, before the moment passes','imp'],['In bursts of passion, late at night','bar'],['I let my subconscious decide','sur'],['Planned, measured, revised','ren']]),
  K('What are you wearing today?','Mirror check',[['One earring shaped like a lobster','sur'],['Classic pieces with a perfect fit','ren'],['Linen and a straw hat, slightly creased','imp'],['Deep red velvet and something gold','bar']]),
  K('Last one: what would you hang above your sofa?','The fun part',[['A garden on a summer afternoon','imp'],['A huge dramatic scene lit by one candle','bar'],['A perfectly balanced portrait','ren'],['A fish riding a bicycle','sur']]),
 ],
 outcomes:[
  {key:'ren',title:'The Renaissance',description:'You believe in balance, proportion and getting things right. People come to you for a plan, and your plans work. Just remember that not everything needs a perfect vanishing point.',color:'#8b2635'},
  {key:'bar',title:'The Baroque',description:'You live in high contrast: big feelings, big gestures, one spotlight and plenty of shadow. Life around you is never boring. Every now and then, try a room with all the lights on.',color:'#5c3460'},
  {key:'imp',title:'Impressionism',description:'You chase moments, not perfection. A change of light, a quick sketch, a walk with no destination: that is where you are happiest. Your friends love that you notice what everyone else walks past.',color:'#b5734a'},
  {key:'sur',title:'Surrealism',description:'Your mind runs on its own logic, and it is usually more interesting than everyone else\'s. You trust dreams, odd ideas and coincidences. Not everyone gets you at first, which is exactly how you like it.',color:'#9a6b1f'},
 ]},
];

const out=[]; for (const v of TESTLER){ const r=await fetch('/api/quiz-import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(v)}); out.push([v.title,r.status,await r.json()]); } out
