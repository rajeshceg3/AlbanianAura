// Layout repair only. The existing map, state, mission, review and simulation systems remain.
const tools=document.createElement('aside');tools.id='mapTools';tools.hidden=true;tools.setAttribute('aria-label','Map tools and simulations');tools.innerHTML='<div class="tools-heading"><h2>Map tools</h2><button id="closeMapTools">Close</button></div><p>Fictional crowd, risk, signal, satellite and drone displays. Not live data, actual surveillance or a safe route recommendation.</p>';
document.body.append(tools);
const filters=document.querySelector('#filter-container'),controls=document.querySelector('.ui-controls'),row=document.querySelector('.controls-row');
const lang=document.querySelector('#langSwitcher'),explore=document.querySelector('#exploreBtn');controls.append(lang,explore);
for(const el of [...row.children]) tools.append(el);
for(const el of [...controls.children])if(el!==filters&&el!==lang&&el!==explore&&el!==row)tools.append(el);
row.remove();tools.append(document.querySelector('#dream-controls'));controls.append(document.querySelector('#missionControlToggle'));
const setTools=open=>{tools.hidden=!open;document.querySelector('#toolsToggle').setAttribute('aria-expanded',''+open)};
document.querySelector('#toolsToggle').onclick=()=>setTools(tools.hidden);document.querySelector('#closeMapTools').onclick=()=>setTools(false);
document.querySelector('#resetMap').onclick=()=>{if(commandHUD.active)commandHUD.toggle();if(dreamMode)toggleDreamMode();map.closePopup();map.stop();map.invalidateSize({pan:false});map.setView([41.1533,20.1683],7,{animate:false,reset:true})};
document.querySelector('#themeMap').onclick=()=>{document.body.classList.toggle('readable-dark');document.querySelector('#themeMap').textContent=document.body.classList.contains('readable-dark')?'Light UI':'Dark UI'};
const notice=document.createElement('div');notice.id='tileStatus';notice.setAttribute('role','status');notice.hidden=true;notice.textContent='Some map tiles are unavailable. Place markers, search and itineraries still work.';document.body.append(notice);baseLayer.on('tileerror',()=>notice.hidden=false);generativeLayer.on('tileerror',()=>notice.hidden=false);
for(const selector of ['#scoutOpsPanel','#chronosPanel','#missionControlPanel']){const p=document.querySelector(selector);const note=document.createElement('p');note.className='simulation-note';note.textContent='Simulation only. No live crowd, weather, road, risk or surveillance data.';p.prepend(note)}
const onEscape=e=>{if(e.key==='Escape')setTools(false)};document.addEventListener('keydown',onEscape);
window.addEventListener('resize',()=>map.invalidateSize());
// Explicit labels survive language changes without changing the original translations or state keys.
function labelModes(){document.querySelector('#missionControlToggle').textContent=appState.language==='sq'?'Itineraret':'Itineraries';document.querySelector('#generativeModeBtn').textContent=appState.language==='sq'?'Pamje alternative':'Alternate map';document.querySelector('#dreamModeBtn').textContent=appState.language==='sq'?'Pamje e qetë':'Quiet view'}
appState.subscribe('languageChanged',()=>queueMicrotask(labelModes));labelModes();
map.attributionControl.setPrefix(false);
const links=document.createElement('p');links.className='map-references';links.innerHTML='<a href="https://opentopomap.org/about" target="_blank" rel="noopener">Map source and licence</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener">Report a map issue</a><br>Inherited place descriptions, photos and historical trivia have not been independently fact-checked. Photos have unverified photographer credits. Saved plans and reviews stay only in this browser.';tools.append(links);
// A tool reveals its own panel, so the drawer gets out of the way.
tools.addEventListener('click',e=>{if(e.target.closest('button')&&e.target.closest('button').id!=='closeMapTools')setTools(false)});
const licence=map.attributionControl.getContainer();licence.classList.add('map-licence');document.body.append(licence);
map.on('popupopen',e=>{for(const img of e.popup.getElement().querySelectorAll('img')){const hide=()=>{img.hidden=true;img.style.setProperty("display","none","important")};img.addEventListener('error',hide);if(img.complete&&!img.naturalWidth)hide()}});
const closeChronos=document.createElement('button');closeChronos.id='closeChronos';closeChronos.textContent='Close history';closeChronos.onclick=()=>document.querySelector('.chronos-toggle').click();document.querySelector('#chronosPanel .chronos-header').append(closeChronos);
