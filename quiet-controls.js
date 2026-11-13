// On-demand interface only. The existing map and specialist systems keep their handlers.
(() => {
 const launch=document.createElement('button');
 launch.id='explore-albania';launch.className='control-button';launch.textContent='Explore Albania';
 launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-controls','albania-tools');launch.setAttribute('aria-expanded','false');
 const panel=document.createElement('dialog');panel.id='albania-tools';panel.setAttribute('aria-labelledby','albania-tools-title');
 panel.innerHTML='<div class="tools-heading"><h2 id="albania-tools-title">Explore Albania</h2><button class="control-button" id="close-albania-tools">Done</button></div>';
 const add=(title,...nodes)=>{const s=document.createElement('section'),h=document.createElement('h3');h.textContent=title;s.append(h,...nodes.filter(Boolean));panel.append(s)};
 const controls=document.querySelector('.ui-controls'),filter=document.getElementById('filter-container');
 const select=document.getElementById('typeFilter'),tokens=document.createElement('div');tokens.className='type-tokens';tokens.setAttribute('role','radiogroup');tokens.setAttribute('aria-label',select.getAttribute('aria-label'));select.hidden=true;
 const sync=()=>[...tokens.children].forEach(b=>{const on=b.dataset.value===select.value;b.setAttribute('aria-checked',String(on));b.tabIndex=on?0:-1});
 for(const opt of select.options){const b=document.createElement('button');b.className='control-button';b.type='button';b.dataset.value=opt.value;b.textContent=opt.text;b.setAttribute('role','radio');b.addEventListener('click',()=>{select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync()});b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const bs=[...tokens.children],i=bs.indexOf(b),n=bs[(i+(e.key==='ArrowRight'?1:bs.length-1))%bs.length];n.click();n.focus()});tokens.append(b)}sync();select.addEventListener('change',sync);filter.append(tokens);
 add('Find a place',filter);
 add('Specialist tools',document.getElementById('dream-controls'),document.getElementById('missionControlToggle'),controls);
 document.body.append(launch,panel);
 const close=()=>panel.close();
 launch.addEventListener('click',()=>{panel.showModal();launch.setAttribute('aria-expanded','true');document.getElementById('close-albania-tools').focus()});
 document.getElementById('close-albania-tools').addEventListener('click',close);
 panel.addEventListener('close',()=>{launch.setAttribute('aria-expanded','false');launch.focus()});
 // A tool takes over the map or opens its own panel, never stack those under this dialog.
 panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.closest('.type-tokens')||b.closest('#langSwitcher')||b.id==='close-albania-tools')return;close()},true);
 filter.addEventListener('click',e=>{if(e.target.closest('.search-result-item'))close()},true);
})();
