(()=>{
const d=document,root=d.documentElement;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];

/* live open/closed — America/Chicago, Mon–Fri 8 AM–5 PM; listed holiday closures */
const HOLI={'2026-11-26':'Thanksgiving','2026-11-27':'Black Friday'};
function ctNow(t=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(t);const o={};p.forEach(x=>o[x.type]=x.value);
 return{day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday),min:(+o.hour%24)*60+(+o.minute),date:`${o.year}-${o.month}-${o.day}`}}
function isWork(n){return n.day>=1&&n.day<=5&&!HOLI[n.date]}
function status(){const n=ctNow();const open=isWork(n)&&n.min>=480&&n.min<1020;let t;
 if(open)t='Open now · until 5 PM CT';
 else if(HOLI[n.date])t='Closed today · '+HOLI[n.date];
 else if(isWork(n)&&n.min<480)t='Closed · opens 8 AM CT';
 else{let k=1,nx;for(;k<8;k++){nx=ctNow(new Date(Date.now()+k*864e5));if(isWork(nx))break}
  t='Closed · opens '+(k===1?'tomorrow':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][nx.day])+' 8 AM CT'}
 $$('[data-status]').forEach(el=>{el.classList.toggle('open',open);el.classList.toggle('closed',!open);const s=$('span',el);if(s)s.textContent=t});
 $$('.hours tr').forEach(tr=>tr.classList.toggle('today',+tr.dataset.d===n.day))}
status();setInterval(status,60000);

/* header, fuel-line progress, mobile bar */
const hdr=$('.hdr'),prog=$('.progress'),mbar=$('.mbar');
function onScroll(){const y=scrollY,h=root.scrollHeight-innerHeight;hdr&&hdr.classList.toggle('scrolled',y>30);if(prog)prog.style.transform=`scaleX(${h>0?y/h:0})`;if(mbar)mbar.classList.toggle('show',y>200)}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* mobile nav */
const bg=$('.burger'),mn=$('.mnav');
if(bg&&mn){const set=o=>{bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu');mn.classList.toggle('open',o);mn.setAttribute('aria-hidden',!o);d.body.style.overflow=o?'hidden':''};
 bg.addEventListener('click',()=>set(bg.getAttribute('aria-expanded')!=='true'));
 $$('a',mn).forEach(a=>a.addEventListener('click',()=>set(false)));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&mn.classList.contains('open')){set(false);bg.focus()}})}

/* split headings into characters */
$$('.split-h').forEach(h=>{if(RM)return;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(d.createTextNode(w));return}const ws=d.createElement('span');ws.style.whiteSpace='nowrap';ws.style.display='inline-block';[...w].forEach(ch=>{const s=d.createElement('span');s.className='ch1';s.textContent=ch;ws.appendChild(s)});f.appendChild(ws)});c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};
 h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());walk(h);[...h.querySelectorAll('span:not(.ch1)')].forEach(s=>{if(!s.closest('[aria-hidden]'))s.setAttribute('aria-hidden','true')});$$('.ch1',h).forEach((c,i)=>c.style.transitionDelay=(i*22)+'ms')});

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
$$('[data-r],.stagger,.split-h').forEach(el=>{if(RM)el.classList.add('in');else io.observe(el)});
$$('.stagger').forEach(g=>[...g.children].forEach((c,i)=>c.style.transitionDelay=(i*70)+'ms'));

/* bay-door intro (home only, once per session) */
const hero=$('.hero'),door=$('.door');
function goHero(){hero&&hero.classList.add('go')}
if(door){let seen=false;try{seen=sessionStorage.getItem('cds-door')==='1';sessionStorage.setItem('cds-door','1')}catch(e){}
 if(RM||seen){door.classList.add('gone');goHero()}
 else{setTimeout(()=>door.classList.add('up'),650);setTimeout(goHero,1050);setTimeout(()=>door.classList.add('gone'),1900)}}
else goHero();

/* parallax */
const px=$$('[data-px]');
if(!RM&&px.length){const tick=()=>{px.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100)return;const f=+el.dataset.px;const c=r.top+r.height/2-innerHeight/2;el.style.transform=`translate3d(0,${(c*-f).toFixed(1)}px,0)`})};
 addEventListener('scroll',()=>requestAnimationFrame(tick),{passive:true});addEventListener('resize',tick);tick()}

/* tach gauges + counters */
function runCount(el){const end=+el.dataset.count,dec=+(el.dataset.dec||0),out=$('b',el)||el;const g=el.closest('.gauge');
 if(g){const arc=$('.val',g);if(arc)arc.style.strokeDashoffset=+arc.dataset.len*(1-(+arc.dataset.frac));const n=$('.ndl',g);if(n)n.style.transform=`rotate(${n.dataset.deg}deg)`}
 if(RM){out.textContent=end.toFixed(dec);return}
 const t0=performance.now(),D=1900;(function f(t){const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,4);out.textContent=(end*e).toFixed(dec);if(k<1)requestAnimationFrame(f);else out.textContent=end.toFixed(dec)})(t0)}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target)}}),{threshold:.35});
$$('[data-count]').forEach(el=>cio.observe(el));

/* tilt cards */
if(FINE&&!RM)$$('.tcard,.pcard').forEach(c=>{c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.setProperty('--ry',(x*9).toFixed(2)+'deg');c.style.setProperty('--rx',(-y*9).toFixed(2)+'deg')});c.addEventListener('pointerleave',()=>{c.style.setProperty('--ry','0deg');c.style.setProperty('--rx','0deg')})});

/* magnetic buttons */
if(FINE&&!RM)$$('.btn.mag').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform=`translate(${(x*.2).toFixed(1)}px,${(y*.3).toFixed(1)}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});

/* road timeline: lane line draws + truck drives down as you scroll */
$$('.tl').forEach(tl=>{const svg=$('svg.line',tl),p=$('.draw',tl),tk=$('.truck',tl),steps=$$('.step',tl);
 function upd(){const r=tl.getBoundingClientRect(),H=r.height;svg.setAttribute('viewBox',`0 0 24 ${H}`);$$('line',svg).forEach(l=>l.setAttribute('y2',H));
  const k=RM?1:Math.min(1,Math.max(0,(innerHeight*.6-r.top)/H));p.setAttribute('y2',H*k);if(tk)tk.style.top=Math.max(0,H*k-16)+'px';
  steps.forEach(s=>{const sr=s.getBoundingClientRect();s.classList.toggle('lit',RM||sr.top+20<innerHeight*.6)})}
 addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});addEventListener('resize',upd);upd()});

/* reviews carousel */
$$('.car').forEach(c=>{const tr=$('.car-track',c),sl=$$('.slide',c),dots=$('.dots',c);let i=0,tm;
 sl.forEach((s,k)=>{const b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Show review '+(k+1));b.onclick=()=>go(k,1);dots.appendChild(b)});
 function go(k,user){i=(k+sl.length)%sl.length;tr.style.transform=`translateX(${-100*i}%)`;$$('button',dots).forEach((b,j)=>b.setAttribute('aria-current',j===i));sl.forEach((s,j)=>{s.setAttribute('aria-hidden',j!==i);s.inert=j!==i});if(user)auto()}
 function auto(){clearInterval(tm);if(!RM)tm=setInterval(()=>go(i+1),7000)}
 $('.pv',c).onclick=()=>go(i-1,1);$('.nx',c).onclick=()=>go(i+1,1);
 c.addEventListener('mouseenter',()=>clearInterval(tm));c.addEventListener('mouseleave',auto);c.addEventListener('focusin',()=>clearInterval(tm));c.addEventListener('focusout',auto);
 let sx=null;tr.addEventListener('pointerdown',e=>sx=e.clientX);addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)go(i+(dx<0?1:-1),1)});
 go(0);auto()});

/* draggable gallery + lightbox */
$$('.gal-track').forEach(t=>{let down=false,sx=0,sl=0,moved=0,v=0,lx=0,raf;
 t.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=0;sx=lx=e.clientX;sl=t.scrollLeft;t.classList.add('drag');cancelAnimationFrame(raf)});
 addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));v=e.clientX-lx;lx=e.clientX;t.scrollLeft=sl-dx});
 addEventListener('pointerup',()=>{if(!down)return;down=false;t.classList.remove('drag');if(!RM){(function m(){v*=.92;t.scrollLeft-=v;if(Math.abs(v)>.5)raf=requestAnimationFrame(m)})()}});
 t.addEventListener('click',e=>{if(moved>6){e.preventDefault();e.stopPropagation();moved=0}},true)});
const lb=$('.lb');
if(lb){const items=$$('.gal-item'),im=$('img',lb),cap=$('p',lb),btns=$$('button',lb);let k=0,last=null;
 function show(n){k=(n+items.length)%items.length;const it=items[k],ti=$('img',it);im.src=it.dataset.full;im.alt=ti.alt;cap.textContent=ti.alt}
 items.forEach((it,n)=>it.addEventListener('click',()=>{last=it;show(n);lb.classList.add('open');lb.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';$('.x1',lb).focus()}));
 const close=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');d.body.style.overflow='';last&&last.focus()};
 $('.x1',lb).onclick=close;$('.pv',lb).onclick=()=>show(k-1);$('.nx',lb).onclick=()=>show(k+1);
 lb.addEventListener('click',e=>{if(e.target===lb)close()});
 let tx=null;lb.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});lb.addEventListener('touchend',e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50)show(k+(dx<0?1:-1))});
 addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(k-1);if(e.key==='ArrowRight')show(k+1);
  if(e.key==='Tab'){const f=btns[0],l=btns[btns.length-1],i=btns.indexOf(d.activeElement);e.preventDefault();btns[(i+(e.shiftKey?-1:1)+btns.length)%btns.length].focus()}})}

/* demo pill */
const dm=$('.demo');if(dm){try{if(sessionStorage.getItem('cds-demo')==='x')dm.remove()}catch(e){};const x=$('button',dm);x&&x.addEventListener('click',()=>{dm.remove();try{sessionStorage.setItem('cds-demo','x')}catch(e){}})}
})();
