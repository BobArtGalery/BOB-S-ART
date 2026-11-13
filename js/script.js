const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
// menu mobile
const burger=$('.burger'),nav=$('nav');
burger.onclick=()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)};
addEventListener('scroll',()=>$('header').classList.toggle('scrolled',scrollY>10),{passive:true});
// images manquantes -> cadre de remplacement
const fix=i=>{if(i.dataset.t&&!i.nextElementSibling?.classList.contains('ph')){const d=document.createElement('div');d.className='ph';d.textContent=i.dataset.t;i.replaceWith(d)}};
const loaded=$$('img').map(i=>new Promise(r=>{const ok=()=>r(true),ko=()=>{fix(i);r(false)};
 if(i.loading==='lazy'){i.onerror=ko;r(true);return}
 if(i.complete)(i.naturalWidth?ok():ko());else{i.onload=ok;i.onerror=ko}}));
// apparition au scroll
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});
$$('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%2)*.12+'s';io.observe(el)});
// carrousel (flèches, glisser à la souris / au doigt, trackpad, défilement auto)
const hero=$('.hero');
if(hero)Promise.all(loaded).then(res=>{
 const track=$('.slides',hero),all=$$('.slide',hero);
 all.forEach(s=>{if(!$('img',s))s.remove()});
 const sl=$$('.slide',hero),n=sl.length,fill=$('.prog i');let c=0,t;
 const go=k=>{c=(k+n)%n;track.style.transform=`translateX(-${c*100}%)`;fill.style.width=((c+1)/n*100)+'%'};
 const rst=()=>{clearInterval(t);if(n>1)t=setInterval(()=>go(c+1),5500)};
 $('.prev').onclick=()=>{go(c-1);rst()};$('.next').onclick=()=>{go(c+1);rst()};
 $$('img',hero).forEach(i=>i.draggable=false);
 // glisser
 let x0=0,dx=0,down=false,moved=false,wasDrag=false;
 hero.addEventListener('pointerdown',e=>{if(n<2||(e.pointerType==='mouse'&&e.button!==0))return;down=true;moved=false;x0=e.clientX;dx=0});
 hero.addEventListener('pointermove',e=>{
  if(!down)return;dx=e.clientX-x0;
  if(!moved&&Math.abs(dx)>6){moved=true;hero.classList.add('drag');clearInterval(t);try{hero.setPointerCapture(e.pointerId)}catch(_){}}
  if(moved){const edge=(c===0&&dx>0)||(c===n-1&&dx<0);track.style.transform=`translateX(calc(-${c*100}% + ${edge?dx*.35:dx}px))`}
 });
 const end=()=>{
  if(!down)return;down=false;
  if(moved){
   hero.classList.remove('drag');wasDrag=true;setTimeout(()=>wasDrag=false,0);
   const lim=Math.min(90,hero.offsetWidth*.15);
   if(Math.abs(dx)>lim&&!((c===0&&dx>0)||(c===n-1&&dx<0)))go(c+(dx<0?1:-1));else go(c);
   rst();
  }
 };
 hero.addEventListener('pointerup',end);hero.addEventListener('pointercancel',end);
 hero.addEventListener('click',e=>{if(wasDrag){e.stopPropagation();e.preventDefault()}},true);
 // trackpad / molette horizontale
 let wl=0;hero.addEventListener('wheel',e=>{
  if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>20){e.preventDefault();
   const now=Date.now();if(now-wl>700){wl=now;go(c+(e.deltaX>0?1:-1));rst()}}
 },{passive:false});
 hero.onmouseenter=()=>clearInterval(t);hero.onmouseleave=()=>{if(!down)rst()};
 if(n<2){$$('.ctrl button').forEach(b=>b.hidden=true);hero.style.cursor='default'}
 go(0);rst();
});
// agrandissement des images (presque plein écran)
const lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Image agrandie');
lb.innerHTML='<button class="x" aria-label="Fermer">×</button><button class="lp" aria-label="Image précédente">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="ln" aria-label="Image suivante">›</button>';
document.body.appendChild(lb);
const lbImg=$('img',lb),lbCap=$('figcaption',lb);let list=[],cur=0,opener=null;
const SEL='.slide img,.work img,.photo img,.pic img';
$$(SEL).forEach(i=>{i.classList.add('zoomable');i.tabIndex=0;i.setAttribute('role','button');i.setAttribute('aria-label','Agrandir : '+i.alt)});
const show=k=>{cur=(k+list.length)%list.length;const i=list[cur];lbImg.src=i.src;lbImg.alt=i.alt;lbCap.textContent=i.alt};
const openLb=i=>{opener=i;list=$$(SEL).filter(x=>x.classList.contains('zoomable'));lb.classList.toggle('single',list.length<2);show(list.indexOf(i));lb.classList.add('open');document.body.classList.add('lbopen');$('.x',lb).focus()};
const closeLb=()=>{lb.classList.remove('open');document.body.classList.remove('lbopen');opener&&opener.focus({preventScroll:true})};
document.addEventListener('click',e=>{const i=e.target.closest('img.zoomable');if(i&&!lb.contains(i))openLb(i)});
document.addEventListener('keydown',e=>{
 if(lb.classList.contains('open')){
  if(e.key==='Escape')closeLb();else if(e.key==='ArrowRight')show(cur+1);else if(e.key==='ArrowLeft')show(cur-1);
 }else if(e.key==='Enter'&&e.target.matches?.('img.zoomable'))openLb(e.target);
});
$('.x',lb).onclick=closeLb;$('.lp',lb).onclick=()=>show(cur-1);$('.ln',lb).onclick=()=>show(cur+1);
lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='FIGURE')closeLb()});
let lx=null;lb.addEventListener('touchstart',e=>lx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{if(lx!==null&&list.length>1){const d=e.changedTouches[0].clientX-lx;if(Math.abs(d)>50)show(cur+(d<0?1:-1))}lx=null});

// formulaire d'inscription : contrôle de remplissage et de validité de l'e-mail (aucune donnée enregistrée)
const form=$('#signup');
if(form){
 const nameRule=l=>v=>{v=v.trim();return v.length<2?`Veuillez saisir votre ${l} (2 caractères minimum).`:/^\p{L}[\p{L}\s'’-]*$/u.test(v)?'':`Le ${l} ne doit contenir que des lettres.`};
 const rules={prenom:nameRule('prénom'),nom:nameRule('nom'),
  mail:v=>{v=v.trim();return !v?'Veuillez saisir votre adresse e-mail.':/^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v)?'':'Cette adresse e-mail n’est pas valide (exemple : nom@domaine.ch).'}};
 const fields=$$('input',form),ok=$('#ok');
 const check=el=>{const m=rules[el.name](el.value);$('#e-'+el.name).textContent=m;el.setAttribute('aria-invalid',m?'true':'false');return !m};
 fields.forEach(el=>{el.addEventListener('blur',()=>{if(el.value||el.getAttribute('aria-invalid'))check(el)});el.addEventListener('input',()=>{if(el.getAttribute('aria-invalid')==='true')check(el)})});
 form.addEventListener('submit',e=>{
  e.preventDefault();ok.hidden=true;
  const bad=fields.filter(el=>!check(el));
  if(bad.length){bad[0].focus();return}
  const p=$('#prenom').value.trim();form.reset();fields.forEach(el=>el.removeAttribute('aria-invalid'));
  ok.textContent=`Merci ${p} ! Votre formulaire est valide. (Démonstration : aucune donnée n’est enregistrée.)`;ok.hidden=false;ok.scrollIntoView({block:'center'});
 });
}
