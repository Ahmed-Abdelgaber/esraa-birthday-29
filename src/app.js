import { STORY, TOTAL_DURATION, PHOTO_ROLES, ACTS, getMoment, formatTime } from './story.js';
import { ASSET_MANIFEST } from '../asset-manifest.js';
import { AudioDirector } from './audio.js';

const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const direction = text => /[\u0600-\u06ff]/.test(text) ? 'rtl' : 'ltr';
const resolvePhoto = role => ASSET_MANIFEST.photos[role]?.path || `./images/${role}.svg`;
let state = 'idle';
let position = 0;
let startedAt = 0;
let frame;
let sceneIndex = -1;
let beatIndex = -1;
let shotIndex = -1;
let captionsVisible = true;
let wasPlayingBeforeDialog = false;
let lastTimeLabel = '';
let audioNoticeShown = false;
const prefetchedPhotos = new Set();

function prefetchPhotos(roles) {
  for (const role of roles) {
    const path = resolvePhoto(role);
    if (prefetchedPhotos.has(path)) continue;
    prefetchedPhotos.add(path);
    const image = new Image();
    image.src = path;
    // Keep network warm without decoding the entire full-resolution album.
  }
}
function prefetchUpcoming(moment) {
  const shots = moment.scene.shots || [];
  const roles = shots.slice(moment.shotIndex + 1, moment.shotIndex + 3).map(shot => shot.role);
  if (moment.shotIndex >= shots.length - 2) {
    const next = STORY[moment.sceneIndex + 1];
    roles.push(...(next?.shots || []).slice(0, 2).map(shot => shot.role));
    roles.push(...(next?.evidence || []).slice(0, 2));
  }
  prefetchPhotos(roles);
}

const audio = new AudioDirector(() => {
  if (audioNoticeShown) return;
  audioNoticeShown = true;
  $('player-note').textContent = 'بعض ملفات الصوت ما اشتغلتش. الحكاية والكلام المكتوب لسه شغّالين.';
}, report => {
  document.body.dataset.audioState = report.failed ? 'fallback' : 'ready';
  document.body.dataset.audioContext = report.contextState;
  document.body.dataset.audioTracks = report.loaded.join(',');
  document.body.dataset.audioEffects = JSON.stringify(report.effects);
});
const getTime = () => state === 'playing' ? Math.min(TOTAL_DURATION, position + (performance.now() - startedAt) / 1000) : position;
const copyMarkup = () => '<div class="scene-copy"><p class="scene-eyebrow" id="scene-eyebrow"></p><h2 class="scene-heading" id="scene-heading"></h2><p class="scene-sub" id="scene-sub"></p><div class="scene-rule" aria-hidden="true"></div></div>';

function imageMarkup(role, label, evidence = false) {
  return `<figure class="${evidence ? 'evidence-photo' : 'photo-card is-new'}"><img src="${escape(resolvePhoto(role))}" alt="${escape(PHOTO_ROLES[role].label)}" width="720" height="900" decoding="async" /><figcaption dir="ltr">${escape(label)}</figcaption></figure>`;
}
function protectImages(container) {
  container.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
    // A mistyped or invalid custom photo never interrupts the experience.
    if (img.dataset.recovered) return;
    img.dataset.recovered = 'true';
    img.src = './images/RECENT_PORTRAIT.svg';
  }, { once: true }));
}
function renderScene(moment) {
  const { scene } = moment;
  $('cinema').dataset.theme = scene.theme;
  $('stage').classList.remove('is-blackout');
  let markup;
  if (scene.type === 'photo') markup = `<div class="scene-layout"><div id="photo-slot" class="photo-slot"></div>${copyMarkup()}</div>`;
  else if (scene.type === 'evidence') markup = `<div class="scene-layout evidence-layout"><div class="evidence-board">${scene.evidence.map((role, index) => imageMarkup(role, `EVIDENCE #0${index + 1}`, true)).join('')}</div>${copyMarkup()}</div>`;
  else if (scene.type === 'news') markup = `<div class="full-scene news-layout"><span class="news-tab" dir="ltr">CASE 025 / OPEN</span>${copyMarkup()}<span class="news-side-label utility" dir="ltr">BIRTHDAY BUREAU OF INVESTIGATION</span></div>`;
  else if (scene.type === 'black') markup = '<div class="full-scene" aria-label="لحظة هدوء"></div>';
  else markup = `<div class="full-scene ${scene.type}-layout">${copyMarkup()}</div>`;
  $('stage').innerHTML = markup;
  protectImages($('stage'));
  if ($('scene-eyebrow')) { $('scene-eyebrow').textContent = scene.eyebrow; $('scene-eyebrow').dir = direction(scene.eyebrow); }
  $('act-label').textContent = ACTS[scene.act];
  $('scene-label').textContent = `${String(moment.sceneIndex + 1).padStart(2, '0')} / ${STORY.length}`;
  $('announcement').textContent = `${ACTS[scene.act]}، ${scene.name}`;
  beatIndex = -1; shotIndex = -1;
}
function updateShot(moment) {
  if (moment.shotIndex < 0) return;
  const shot = moment.scene.shots[moment.shotIndex];
  const slot = $('photo-slot');
  if (!slot) return;
  // Keep at most one fading image and one current image during a dissolve.
  slot.querySelectorAll('.is-leaving').forEach(element => element.remove());
  slot.querySelector('.photo-card')?.classList.add('is-leaving');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = imageMarkup(shot.role, shot.label);
  const photo = wrapper.firstElementChild;
  slot.append(photo);
  protectImages(photo);
}
function updateBeat(moment, silent) {
  const beat = moment.scene.beats[moment.beatIndex];
  if (!beat) return;
  const heading = $('scene-heading');
  const sub = $('scene-sub');
  if (heading) {
    heading.textContent = beat.heading;
    heading.dir = direction(beat.heading);
    heading.classList.remove('beat-arrive');
    // Re-run only the deliberate title entrance, independent of timeline ticks.
    void heading.offsetWidth;
    heading.classList.add('beat-arrive');
    sub.textContent = beat.sub || '';
    sub.dir = direction(beat.sub || '');
  }
  $('stage').classList.toggle('is-blackout', Boolean(beat.blackout));
  $('caption').textContent = beat.caption || '';
  $('caption').dir = direction(beat.caption || '');
  $('caption-wrap').hidden = !captionsVisible;
  if (beat.sound && !silent) audio.cue(beat.sound);
}
function render(time, silent = false) {
  const moment = getMoment(time);
  if (sceneIndex !== moment.sceneIndex) {
    sceneIndex = moment.sceneIndex;
    renderScene(moment);
    if (state === 'playing') audio.sync(time);
  }
  if (shotIndex !== moment.shotIndex) { shotIndex = moment.shotIndex; updateShot(moment); prefetchUpcoming(moment); }
  if (beatIndex !== moment.beatIndex) { beatIndex = moment.beatIndex; updateBeat(moment, silent); }
  $('seek').value = String(time);
  const label = formatTime(time);
  if (label !== lastTimeLabel) {
    lastTimeLabel = label;
    $('elapsed').textContent = label;
    $('seek').setAttribute('aria-valuetext', `${label} من ${formatTime(TOTAL_DURATION)}، ${moment.scene.name}`);
  }
  document.querySelectorAll('.segment-fill').forEach((fill, index) => {
    const scene = STORY[index];
    fill.style.transform = `scaleX(${Math.max(0, Math.min(1, (time - scene.start) / scene.duration))})`;
  });
}
function updatePlayButton() {
  const playing = state === 'playing';
  $('toggle-play').textContent = playing ? 'Ⅱ' : '▶';
  const label = playing ? 'إيقاف مؤقت' : 'كمّلي الحكاية';
  $('toggle-play').setAttribute('aria-label', label);
  $('toggle-play').title = label;
  $('cinema').classList.toggle('is-paused', !playing);
}
function tick() {
  if (state !== 'playing') return;
  const time = getTime();
  render(time);
  if (time >= TOTAL_DURATION) {
    position = TOTAL_DURATION; state = 'ended'; audio.pause();
    $('end-card').hidden = false; $('caption-wrap').hidden = true;
    updatePlayButton(); $('replay').focus({ preventScroll: true });
    $('announcement').textContent = 'كل سنة وإنتِ أحلى حكاية. تقدري تعيديها من البداية.';
    return;
  }
  frame = requestAnimationFrame(tick);
}
function play() {
  if (state === 'playing') return;
  if (position >= TOTAL_DURATION) seek(0);
  state = 'playing'; startedAt = performance.now();
  $('end-card').hidden = true;
  $('caption-wrap').hidden = !captionsVisible;
  audio.start(getTime); updatePlayButton(); tick();
}
function pause() {
  if (state !== 'playing') return;
  position = getTime(); state = 'paused'; cancelAnimationFrame(frame);
  audio.pause(); updatePlayButton();
}
function seek(time) {
  position = Math.max(0, Math.min(TOTAL_DURATION, Number(time) || 0));
  startedAt = performance.now();
  if (state === 'ended') state = 'paused';
  $('end-card').hidden = true;
  render(position, true);
  if (state === 'playing') audio.sync(position);
  updatePlayButton();
}
function start() {
  if (state !== 'idle') return;
  $('lobby').hidden = true; $('experience').hidden = false;
  play(); $('toggle-play').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function setSound(muted) {
  audio.setMuted(muted);
  $('lobby-sound').setAttribute('aria-pressed', String(!muted));
  $('lobby-sound').lastElementChild.textContent = muted ? 'من غير صوت' : 'بالموسيقى والصوت';
  $('sound').setAttribute('aria-pressed', String(muted));
  $('sound').textContent = muted ? '∅' : '♪';
  const label = muted ? 'تشغيل الصوت' : 'كتم الصوت';
  $('sound').setAttribute('aria-label', label); $('sound').title = label;
}

$('cover-image').src = resolvePhoto('RECENT_PORTRAIT');
protectImages($('lobby'));
$('seek').max = TOTAL_DURATION;
$('total-time').textContent = formatTime(TOTAL_DURATION);
$('segments').innerHTML = STORY.map(scene => `<span class="segment" style="flex:${scene.duration}"><span class="segment-fill"></span></span>`).join('');
$('chapter-list').innerHTML = STORY.filter(scene => scene.type !== 'black').map(scene => `<button class="chapter-button" data-start="${scene.start}" data-scene="${escape(scene.id)}"><span class="chapter-number" dir="ltr">${String(STORY.indexOf(scene) + 1).padStart(2, '0')}</span><span>${escape(scene.name)}</span><span class="chapter-time" dir="ltr">${formatTime(scene.start)}</span></button>`).join('');

$('start').addEventListener('click', start);
$('lobby-sound').addEventListener('click', () => setSound(!audio.muted));
$('sound').addEventListener('click', () => setSound(!audio.muted));
$('toggle-play').addEventListener('click', () => state === 'playing' ? pause() : play());
$('restart').addEventListener('click', () => { seek(0); play(); });
$('replay').addEventListener('click', () => { seek(0); play(); $('toggle-play').focus({ preventScroll: true }); });
$('seek').addEventListener('input', event => seek(event.target.value));
$('captions').addEventListener('click', () => {
  captionsVisible = !captionsVisible;
  $('caption-wrap').hidden = !captionsVisible || state === 'ended';
  $('captions').setAttribute('aria-pressed', String(captionsVisible));
});
$('chapters').addEventListener('click', () => {
  wasPlayingBeforeDialog = state === 'playing'; pause();
  $('chapter-list').querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(button.dataset.scene === STORY[sceneIndex]?.id)));
  $('chapter-dialog').showModal();
});
$('close-chapters').addEventListener('click', () => $('chapter-dialog').close());
$('chapter-dialog').addEventListener('close', () => {
  if (wasPlayingBeforeDialog) play();
  $('chapters').focus({ preventScroll: true });
});
$('chapter-list').addEventListener('click', event => {
  const button = event.target.closest('button[data-start]');
  if (!button) return;
  seek(Number(button.dataset.start)); $('chapter-dialog').close();
});
if (!document.fullscreenEnabled) $('fullscreen').hidden = true;
$('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('experience').requestFullscreen();
  } catch { $('announcement').textContent = 'ملء الشاشة مش متاح في المتصفح ده.'; }
});
document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement ? 'الخروج من ملء الشاشة' : 'ملء الشاشة';
  $('fullscreen').setAttribute('aria-label', label); $('fullscreen').title = label;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'playing') {
    pause(); $('player-note').textContent = 'الحكاية اتوقفت عشان ما يفوتكيش حاجة. دوسي تشغيل لما ترجعي.';
  }
});
document.addEventListener('keydown', event => {
  if (state === 'idle' || $('chapter-dialog').open || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest('button, input, a, [contenteditable]')) return;
  if (event.code === 'Space') { event.preventDefault(); state === 'playing' ? pause() : play(); }
  if (event.code === 'ArrowRight') { event.preventDefault(); seek(getTime() + 5); }
  if (event.code === 'ArrowLeft') { event.preventDefault(); seek(getTime() - 5); }
});
// Start with only the opening photos; warm the next two shots during playback.
window.addEventListener('load', () => {
  prefetchPhotos(['CHILDHOOD_1', 'CHILDHOOD_2A']);
});
