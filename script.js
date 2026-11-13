const fileInput=document.getElementById('fileInput');
const playlistEl=document.getElementById('playlist');
const emptyState=document.getElementById('emptyState');
const audio=document.getElementById('audio');
const playButton=document.getElementById('playButton');
const progress=document.getElementById('progress');
const songs=[];
let current=-1;

function time(sec){if(!Number.isFinite(sec))return '0:00';const m=Math.floor(sec/60);const s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,'0')}`;}
function render(){
  playlistEl.innerHTML='';
  emptyState.hidden=songs.length>0;
  document.getElementById('songCount').textContent=`${songs.length} song${songs.length===1?'':'s'}`;
  songs.forEach((song,i)=>{
    const li=document.createElement('li');li.className='song'+(i===current?' active':'');
    const num=document.createElement('span');num.className='song-number';num.textContent=String(i+1).padStart(2,'0');
    const info=document.createElement('div');
    const name=document.createElement('div');name.className='song-name';name.textContent=song.name;
    const sub=document.createElement('div');sub.className='song-sub';sub.textContent='MP3 • Local file';
    info.append(name,sub);
    const dur=document.createElement('span');dur.className='song-duration';dur.textContent=song.duration||'—';
    li.append(num,info,dur);li.addEventListener('click',()=>loadSong(i,true));playlistEl.append(li);
  });
}
function loadSong(i,autoplay=false){
  if(i<0||i>=songs.length)return;
  current=i;audio.src=songs[i].url;document.getElementById('trackTitle').textContent=songs[i].name;
  document.getElementById('trackArtist').textContent='From your device';
  render();if(autoplay)audio.play().then(()=>playButton.textContent='Ⅱ').catch(()=>{});
}
fileInput.addEventListener('change',()=>{
  [...fileInput.files].forEach(file=>{
    if(!file.type.startsWith('audio/'))return;
    songs.push({name:file.name.replace(/\.[^.]+$/,''),url:URL.createObjectURL(file),duration:''});
  });
  render();if(current===-1&&songs.length)loadSong(0,false);fileInput.value='';
});
playButton.addEventListener('click',()=>{
  if(current===-1&&songs.length)loadSong(0);
  if(!audio.src)return;
  if(audio.paused)audio.play().then(()=>playButton.textContent='Ⅱ').catch(()=>{});
  else{audio.pause();playButton.textContent='▶';}
});
document.getElementById('prevButton').addEventListener('click',()=>{if(songs.length)loadSong((current-1+songs.length)%songs.length,true)});
document.getElementById('nextButton').addEventListener('click',()=>{if(songs.length)loadSong((current+1)%songs.length,true)});
document.getElementById('clearButton').addEventListener('click',()=>{
  audio.pause();songs.forEach(s=>URL.revokeObjectURL(s.url));songs.length=0;current=-1;audio.removeAttribute('src');audio.load();
  document.getElementById('trackTitle').textContent='No song selected';document.getElementById('trackArtist').textContent='Add songs to begin';
  playButton.textContent='▶';progress.value=0;render();
});
audio.addEventListener('loadedmetadata',()=>{
  if(current>=0){songs[current].duration=time(audio.duration);document.getElementById('duration').textContent=time(audio.duration);render();}
});
audio.addEventListener('timeupdate',()=>{
  document.getElementById('currentTime').textContent=time(audio.currentTime);
  progress.value=audio.duration?(audio.currentTime/audio.duration)*100:0;
});
progress.addEventListener('input',()=>{if(audio.duration)audio.currentTime=(progress.value/100)*audio.duration});
audio.addEventListener('ended',()=>{if(songs.length)loadSong((current+1)%songs.length,true)});
audio.addEventListener('play',()=>playButton.textContent='Ⅱ');
audio.addEventListener('pause',()=>playButton.textContent='▶');
document.getElementById('volume').addEventListener('input',e=>audio.volume=Number(e.target.value));
audio.volume=.8;
render();
