(function(){
 const air=(gain=.3,cutoff=800)=>({type:'wind',params:{baseCutoff:cutoff},gain});
 const places=[
  {id:'overview',beds:[air(.24)],voices:[]},
  {id:'courtyard',beds:[air(.22,650)],voices:[{kind:'dove',weight:1,gain:.1}]},
  {id:'coast',beds:[{type:'surf',params:{period:8,lowpass:950,swash:.4},gain:.32},air(.18)],voices:[{kind:'gull',weight:1,gain:.11}]},
  {id:'pass',beds:[air(.3,1200),{type:'rustle',params:{},gain:.14}],voices:[]},
  {id:'lake',beds:[{type:'surf',params:{period:3.3,lowpass:1700,swash:.12},gain:.21},air(.12)],voices:[]},
  {id:'river',beds:[{type:'stream',params:{cutoff:2300},gain:.32},air(.12)],voices:[]},
  {id:'ruins',beds:[air(.24,650),{type:'insects',params:{},gain:.07}],voices:[]}
 ].map(p=>({...p,voiceGap:[25,45]}));
if(typeof module!=='undefined')module.exports=places;else window.albaniaPlaces=places;
})();
