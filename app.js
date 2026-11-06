(() => {
  'use strict';
  const C = window.INVITACION || {};
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const chapters = $$('.chapter');
  const rails = $$('.rail-dot');
  const sourceImages = chapters.map(ch => $('.artwork-image', ch).getAttribute('src'));
  let active = 0;
  let toastHandle;

  function notify(message) {
    const bar = $('#toast');
    bar.textContent = message;
    bar.classList.add('show');
    clearTimeout(toastHandle);
    toastHandle = setTimeout(() => bar.classList.remove('show'), 3400);
  }
  function setActive(index) {
    if (index < 0 || index >= chapters.length) return;
    active = index;
    rails.forEach((link, i) => {
      link.classList.toggle('is-current', i === index);
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    $('#currentChapterTitle').textContent = chapters[index].dataset.label;
    $('#chapterCount').textContent = String(index + 1).padStart(2, '0');
    $('#previousChapter').disabled = index === 0;
    $('#nextChapter').disabled = index === chapters.length - 1;
  }
  function goTo(index) {
    chapters[Math.min(Math.max(0, index), chapters.length - 1)].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    setActive(Math.min(Math.max(0,index),chapters.length - 1));
  }
  $('#previousChapter').addEventListener('click', () => goTo(active-1));
  $('#nextChapter').addEventListener('click', () => goTo(active+1));

  if ('IntersectionObserver' in window) {
    const showObserver = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in-view');
    }), {threshold: .08});
    chapters.forEach(ch => showObserver.observe(ch));
    const currentObserver = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) setActive(Number(e.target.dataset.index));
    }), {rootMargin:'-35% 0px -42% 0px',threshold:0});
    chapters.forEach(ch => currentObserver.observe(ch));
  } else chapters.forEach(ch => ch.classList.add('in-view'));
  const updatePageProgress = () => {
    const max = document.documentElement.scrollHeight-innerHeight;
    $('#topProgress').style.width = (max > 0 ? Math.max(0,Math.min(100,scrollY/max*100)) : 100) + '%';
  };
  addEventListener('scroll', updatePageProgress, {passive:true});
  addEventListener('resize', updatePageProgress);
  updatePageProgress();
  setActive(0);
  // Make the cover visible without waiting for a scroll event.
  setTimeout(() => chapters[0].classList.add('in-view'), 50);

  const name = String(C.nombre || 'Cumpleañera');
  $$('[data-bind="nombre"]').forEach(node=>node.textContent=name);
  $$('[data-bind="edad"]').forEach(node=>node.textContent=String(C.edad || '3'));
  if (C.vestimenta) $('#dressText').textContent=C.vestimenta;
  if (C.regaloNota) $('#giftSummary').textContent=C.regaloNota;
  if (C.lugar) $('#venueName').textContent=C.lugar;
  if (C.direccion) $('#venueAddress').textContent=C.direccion;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(C.fecha || '') && /^\d{2}:\d{2}$/.test(C.hora || '') ? new Date(C.fecha+'T'+C.hora+':00') : null;
  const validDate = date instanceof Date && Number.isFinite(date.getTime());
  if (validDate) {
    $('#dayDisplay').textContent=String(date.getDate()).padStart(2,'0');
    $('#monthDisplay').textContent=new Intl.DateTimeFormat('es-MX',{month:'long'}).format(date).toLocaleUpperCase('es-MX');
    $('#yearDisplay').textContent=date.getFullYear();
    $('#hourDisplay').textContent=new Intl.DateTimeFormat('es-MX',{hour:'numeric',minute:'2-digit',hour12:true}).format(date);
    function countdown() {
      const secs = Math.floor((date.getTime()-Date.now())/1000);
      if (secs <= 0) { $('#countdown').hidden=true; return; }
      $('#countdown').hidden=false;
      $('#daysLeft').textContent=String(Math.floor(secs/86400)).padStart(2,'0');
      $('#hoursLeft').textContent=String(Math.floor((secs%86400)/3600)).padStart(2,'0');
      $('#minutesLeft').textContent=String(Math.floor((secs%3600)/60)).padStart(2,'0');
    }
    countdown();setInterval(countdown,60000);
  } else $('#calendarButton').disabled=true;

  function icsEscape(s){return String(s || '').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[;,]/g,m=>'\\'+m);}
  function utcStamp(d){return d.getUTCFullYear()+[d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds()].map(v=>String(v).padStart(2,'0')).join('')+'Z';}
  $('#calendarButton').addEventListener('click',()=>{
    if (!validDate) {notify('Primero configura fecha y hora en config.js');return;}
    const summary=`Cumpleaños de ${name} · ${C.edad || 3} años`;
    const eventEnd = new Date(date.getTime()+3*60*60*1000);
    const text=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Granjita Vintage//Invitacion//ES',
      'BEGIN:VEVENT','UID:granjita-'+date.getTime()+'@invitacion.local','DTSTAMP:'+utcStamp(new Date()),
      'DTSTART:'+utcStamp(date),'DTEND:'+utcStamp(eventEnd),
      'SUMMARY:'+icsEscape(summary),'LOCATION:'+icsEscape([C.lugar,C.direccion].filter(Boolean).join(', ')),
      'DESCRIPTION:'+icsEscape('Una celebración muy especial. La duración indicada es provisional.'),
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const objectURL=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));
    const a=document.createElement('a');a.href=objectURL;a.download='cumpleanos-granjita.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);
    notify('Calendario descargado. Puedes ajustar la duración del evento.');
  });

  const maps = $('#mapsButton');
  if (String(C.mapaURL||'').trim()) {
    if (/^https:\/\//i.test(C.mapaURL.trim())) {maps.href=C.mapaURL.trim(); $('#mapHint').textContent='Se abrirá la ubicación en una nueva pestaña.';}
    else {maps.removeAttribute('href');maps.setAttribute('aria-disabled','true'); $('#mapHint').textContent='El enlace de ubicación debe comenzar con https://';}
  } else if (C.direccion || C.lugar) {
    maps.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([C.lugar,C.direccion].filter(Boolean).join(', '));
    maps.firstChild.textContent='Buscar dirección en Maps ';
    $('#mapHint').textContent='Búsqueda aproximada: para mayor precisión, pega tu enlace de Google Maps en config.js.';
  } else { maps.removeAttribute('href');maps.setAttribute('aria-disabled','true'); }

  if (/^\d{10,15}$/.test(String(C.whatsapp||'').replace(/\D/g,''))) {
    const n=String(C.whatsapp).replace(/\D/g,'');
    const msg=String(C.mensajeRSVP || '¡Hola! Confirmo mi asistencia al cumpleaños de {nombre}.').replaceAll('{nombre}',name);
    const b=$('#rsvpButton');b.href='https://wa.me/'+n+'?text='+encodeURIComponent(msg);b.hidden=false;
  }
  const giftItems=(Array.isArray(C.regalos)?C.regalos:[]).filter(Boolean);
  const giftDialog=$('#giftDialog');
  giftItems.forEach(item=>{const li=document.createElement('li');li.textContent=String(item);$('#giftList').appendChild(li);});
  $('#giftButton').addEventListener('click',()=>giftDialog.showModal());
  $('#dismissGift').addEventListener('click',()=>giftDialog.close());
  $('#closeGift').addEventListener('click',()=>giftDialog.close());
  giftDialog.addEventListener('click',e=>{if(e.target===giftDialog)giftDialog.close();});

  const cover=$('#personalCover');
  if (String(C.fotoPortada||'').trim()) {
    cover.src=C.fotoPortada.trim();cover.hidden=false;
    cover.addEventListener('error',()=>{cover.hidden=true;notify('No se encontró la foto de portada.');});
  }
  const albumPhotos=(Array.isArray(C.fotos)?C.fotos:[]).filter(x=>typeof x==='string'&&x.trim());
  const photoDlg=$('#photoDialog');
  albumPhotos.forEach((src,i)=>{
    const button=document.createElement('button');button.type='button';button.className='album-card';button.setAttribute('aria-label','Ampliar recuerdo '+(i+1));
    const pic=document.createElement('img');pic.src=src;pic.loading='lazy';pic.alt='Recuerdo '+(i+1)+' del álbum';
    const caption=document.createElement('span');caption.textContent='Recuerdo '+String(i+1).padStart(2,'0');
    button.append(pic,caption);button.addEventListener('click',()=>{$('#photoDialogImg').src=src;photoDlg.showModal();});
    pic.addEventListener('error',()=>{button.remove();if(!$('#albumGrid').children.length) $('#album').hidden=true;});
    $('#albumGrid').appendChild(button);
  });
  if (albumPhotos.length) $('#album').hidden=false;
  $('#closePhoto').addEventListener('click',()=>photoDlg.close());
  photoDlg.addEventListener('click',e=>{if(e.target===photoDlg)photoDlg.close();});

  const imageDlg=$('#imageDialog');let zoomIndex=0;
  function updateImage() {
    $('#imageDialogImg').src=sourceImages[zoomIndex];
    $('#imageDialogImg').alt='Pantalla ampliada: '+chapters[zoomIndex].dataset.label;
    $('#imageDialogLabel').textContent=chapters[zoomIndex].dataset.label+' · '+(zoomIndex+1)+' / 6';
    $('#imagePrev').disabled=zoomIndex===0;$('#imageNext').disabled=zoomIndex===5;
  }
  $$('[data-zoom]').forEach(btn=>btn.addEventListener('click',()=>{zoomIndex=Number(btn.dataset.zoom);updateImage();imageDlg.showModal();}));
  $('#closeImage').addEventListener('click',()=>imageDlg.close());
  $('#imagePrev').addEventListener('click',()=>{zoomIndex=Math.max(0,zoomIndex-1);updateImage();});
  $('#imageNext').addEventListener('click',()=>{zoomIndex=Math.min(5,zoomIndex+1);updateImage();});
  imageDlg.addEventListener('click',e=>{if(e.target===imageDlg)imageDlg.close();});
  addEventListener('keydown',e=>{if(imageDlg.open&&e.key==='ArrowRight'){$('#imageNext').click();}if(imageDlg.open&&e.key==='ArrowLeft'){$('#imagePrev').click();}});

  async function share() {
    const link=location.protocol==='file:' ? '(Primero publica tu invitación en GitHub Pages)' : location.href.split('#')[0];
    if (navigator.share && location.protocol!=='file:') {
      try {await navigator.share({title:'Invitación a la granjita',text:'¡Te esperamos en nuestra celebración!',url:link});return;}catch(e){if(e.name==='AbortError')return;}
    }
    try {await navigator.clipboard.writeText(link);notify('Enlace copiado. ¡Listo para compartir!');}
    catch(e){notify(link);}
  }
  $('#shareButton').addEventListener('click',share);
  $('#shareFinalButton').addEventListener('click',share);

  // Música ambiental original, sin depender de archivos externos. Nunca se reproduce automáticamente.
  const musicButton=$('#musicToggle');
  let playing=false,audioContext, notesInterval, audioElement, soundEpoch=0;
  const Melody=[64,67,71,74,72,69,67,64,62,64,67,69,71,67,64,60]; // melodía original simple
  function playBell(midi, when, length=.48) {
    if(!audioContext)return;
    const osc=audioContext.createOscillator(),gain=audioContext.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(440*Math.pow(2,(midi-69)/12),when);
    gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(.035,when+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,when+length);
    osc.connect(gain).connect(audioContext.destination);osc.start(when);osc.stop(when+length+.05);
  }
  function setMusicUI(value){playing=value;musicButton.setAttribute('aria-pressed',String(value));musicButton.setAttribute('aria-label',value?'Pausar música':'Reproducir música');musicButton.querySelector('.music-label').textContent=value?'Pausar':'Música';}
  async function turnMusicOff(){
    clearInterval(notesInterval);notesInterval=null;
    if(audioElement){audioElement.pause();audioElement.currentTime=0;}
    if(audioContext){try{await audioContext.close();}catch(e){}audioContext=null;}
    setMusicUI(false);
  }
  musicButton.addEventListener('click',async()=>{
    if(playing){await turnMusicOff();return;}
    if (C.musicaArchivo) {
      try {audioElement=audioElement||new Audio(C.musicaArchivo);audioElement.loop=true;audioElement.volume=.32;await audioElement.play();setMusicUI(true);}
      catch(e){notify('No se pudo reproducir el archivo de música.');setMusicUI(false);}
      return;
    }
    const AudioClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioClass){notify('Este navegador no admite audio.');return;}
    try{audioContext=new AudioClass();await audioContext.resume();}catch(e){notify('No se pudo activar el audio.');return;}
    let step=0;setMusicUI(true);soundEpoch++;
    const emit=()=>{if(!audioContext||audioContext.state!=='running')return;playBell(Melody[step++%Melody.length],audioContext.currentTime+.02,.36);};
    emit();notesInterval=setInterval(emit,520);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)turnMusicOff();});
})();
