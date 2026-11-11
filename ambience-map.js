// Environmental illustration selected by the place being explored, not its words.
(function(){
 const places=window.albaniaPlaces;
 const byName={'Tirana':1,'Berat':1,'Gjirokastër':1,'Albanian Riviera':2,'Ksamil':2,'Llogara Pass':3,'Lake Ohrid (Albanian side)':4,'Theth National Park':5,'Rozafa Castle':1,'Butrint':6};
 const sound=window.createAlbaniaSoundscape(places);window.albaniaSound=sound;window.albaniaSoundPlaces=places;
 let place=0;
 const button=document.createElement('button');button.id='soundMap';button.textContent='Sound on';button.setAttribute('aria-pressed','false');button.title='Quiet synthesized ambience, not field recordings. Follows the open place.';
 button.onclick=()=>{const on=sound.toggle(place);button.textContent=on?'Sound off':'Sound on';button.setAttribute('aria-pressed',String(on))};document.querySelector('#mapTools .tools-heading').after(button);
 function change(p){if(place===p)return;place=p;sound.setPlace(p)}
 map.on('popupopen',e=>change(byName[e.popup._source?.attractionData?.name]||0));map.on('popupclose',()=>change(0));
})();
