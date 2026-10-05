// Edit this file to personalize the story. Times are seconds within each scene.
// 29 completed years means entering the 30th year, not turning 30.
export const SETTINGS = {
  narrationMode: 'auto', // auto | single | scenes | off
  musicVolume: 0.2,
  voiceVolume: 0.9,
  effectsVolume: 0.25,
  synthMusicWhenMissing: true,
  synthEffectsWhenMissing: true,
};

export const PHOTO_ROLES = {
  CHILDHOOD_1: { label: 'أول صفحة في الحكاية', original: '92fa2226-cfd7-4a04-98bb-4f494455d993.jpg' },
  CHILDHOOD_2A: { label: 'أيام صغيرة، ذكريات كبيرة', original: 'e3dbbec6-3169-4d65-8b14-ada2e1179495.jpg' },
  CHILDHOOD_2B: { label: 'ضحكة من زمان', original: '452fbb50-bbfb-4ca1-8ae3-625cfa73c935.jpg' },
  TEEN: { label: 'والحكاية بتكبر', original: '6a83bfd0-4eaf-445b-9d65-2b7eec3fcd48.jpg' },
  UNIVERSITY: { label: 'بدايات وأحلام', original: 'b39abbfd-54fa-4154-b821-e67abca22494.jpg' },
  AGE_25: { label: 'هنا الزمن أخد إجازة', original: 'b3ed75b7-65d2-45ee-b6ef-212d20ae7d8e.jpg' },
  POST25_1: { label: 'السنة اللي بعدها', original: '47732a88-9e3a-4042-8e8e-3c7b0c66671e.jpg' },
  POST25_2: { label: 'خمسة وعشرين… تاني', original: 'e353cc5f-22a7-4234-a5a7-d3def72bd7b4.jpg' },
  POST25_3: { label: 'لسه خمسة وعشرين', original: 'feb85f6c-4ed9-49a4-987d-d3bc497a5b0f.jpg' },
  POST25_4: { label: 'النسخة المطوّرة', original: '7aa54e84-9517-473c-8dc3-d8543ffb1e15.jpg' },
  RECENT_PORTRAIT: { label: 'أجمل حكاية', original: 'IMG_7872.jpg' },
  FUNNY_PHOTO: { label: 'البصة اللي كلنا عارفينها', original: '4473003b-2669-416d-b3ce-71b1a4599392.jpg' },
  HUSBAND: { label: 'شاهد عيان… وجوزها', original: 'IMG_7632.jpg' },
  COUPLE_FINAL: { label: 'مع بعض، دايمًا', original: 'IMG_7640.jpg' },
  COUPLE_1: { label: 'حكايتنا إحنا', optional: true, fallback: 'COUPLE_FINAL' },
  COUPLE_2: { label: 'اللحظات الحلوة', optional: true, fallback: 'COUPLE_FINAL' },
  COUPLE_3: { label: 'شوية ذكريات لينا', optional: true, fallback: 'COUPLE_FINAL' },
  COUPLE_4: { label: 'كل يوم، اختيار واحد', optional: true, fallback: 'COUPLE_FINAL' },
};

const scenes = [
  { id: 'opening', name: 'في مثل هذا اليوم', act: 1, theme: 'warm', type: 'photo', duration: 10,
    eyebrow: 'من الأرشيف الشخصي · أول الحكاية', shots: [{ at: 0, role: 'CHILDHOOD_1', label: 'ONCE UPON A TIME' }],
    beats: [
      { at: 0, heading: 'في مثل هذا اليوم…', sub: 'منذ سنوات عديدة', caption: 'في مثل هذا اليوم… ومن سنين كتير…' },
      { at: 4, heading: 'وُلدت فتاة جميلة.', sub: 'وكانت الدنيا لسه مش عارفة', caption: 'وُلدت واحدة هتبقى من أهم الناس في حياتي.' },
    ] },
  { id: 'growing', name: 'والحكاية بتكبر', act: 1, theme: 'warm', type: 'photo', duration: 13,
    eyebrow: 'صفحات من عمر جميل', shots: [
      { at: 0, role: 'CHILDHOOD_2A', label: 'GROWING UP…' }, { at: 2, role: 'CHILDHOOD_2B', label: 'LITTLE MOMENTS' },
      { at: 4, role: 'TEEN', label: 'SCHOOL…' }, { at: 6.5, role: 'UNIVERSITY', label: 'UNIVERSITY…' }, { at: 9, role: 'RECENT_PORTRAIT', label: 'LIFE…' },
    ], beats: [
      { at: 0, heading: 'وكبرت…', sub: 'خطوة ورا خطوة', caption: 'كبرت… وراحت المدرسة…' },
      { at: 4, heading: 'وأحلامها كبرت معاها.', sub: 'كل صورة، فصل جديد', caption: 'وكبرت أكتر… واتخرجت…' },
      { at: 8, heading: 'وعاشت الحكاية.', sub: 'لحد ما حصلت حاجة…', caption: 'وعاشت واتعلمت وشافت الدنيا…' },
      { at: 11.3, heading: 'UNTIL SOMETHING HAPPENED.', sub: '', caption: '', blackout: true },
    ] },
  { id: 'incident', name: 'بداية الظاهرة', act: 2, theme: 'case', type: 'photo', duration: 10,
    eyebrow: 'CASE FILE 025 · THE INCIDENT', shots: [{ at: 0, role: 'AGE_25', label: 'EXHIBIT A · THE ORIGINAL 25' }],
    beats: [
      { at: 0, heading: 'AGE: 25', sub: 'THE INCIDENT', caption: 'لحد ما في يوم… وصلت لسن خمسة وعشرين.' },
      { at: 3, heading: 'عجبها السن.', sub: 'عجبها قوي.', caption: 'وهنا حصلت المشكلة. عجبها السن… عجبها قوي.' },
      { at: 6.5, heading: 'الزمن؟ استراحة.', sub: 'DECISION: FINAL', caption: 'فقررت… إنها خلاص مش هتكبر تاني.', sound: 'record-scratch' },
    ] },
  { id: 'conspiracy', name: 'السنين المفقودة', act: 2, theme: 'case', type: 'photo', duration: 18,
    eyebrow: 'THE MISSING YEARS · PHOTO EVIDENCE', shots: [
      { at: 0, role: 'POST25_1', label: 'YEAR +1 · 25 YEARS OLD' }, { at: 4, role: 'POST25_2', label: 'YEAR +2 · 25 AGAIN' },
      { at: 8, role: 'POST25_3', label: 'YEAR +3 · STILL 25' }, { at: 12, role: 'POST25_4', label: 'YEAR +4 · 25 PRO MAX' },
    ], beats: [
      { at: 0, heading: '25 YEARS OLD', sub: 'سنة عدّت…', caption: 'مرت سنة… خمسة وعشرين.', sound: 'click' },
      { at: 4, heading: '25 AGAIN', sub: 'وسنة كمان…', caption: 'مرت سنة كمان… برضه خمسة وعشرين.', sound: 'click' },
      { at: 8, heading: 'STILL 25', sub: 'هل الزمن شغّال عندنا بس؟', caption: 'سنة تالتة؟ خمسة وعشرين.', sound: 'click' },
      { at: 12, heading: '25 PRO MAX', sub: 'العالم اتغيّر.', caption: 'الدنيا اتغيرت. التكنولوجيا اتغيرت. والـAI ظهر.', sound: 'click' },
      { at: 15.5, heading: 'STILL. 25.', sub: 'وهي ثابتة على موقفها.', caption: 'وهي… خمسة وعشرين.' },
    ] },
  { id: 'breaking', name: 'فتح التحقيق', act: 2, theme: 'news', type: 'news', duration: 12,
    eyebrow: 'SPECIAL REPORT · CASE 025', beats: [
      { at: 0, heading: 'BREAKING\nNEWS', sub: 'INVESTIGATION OPENED', caption: 'لكن السنة دي… قررنا إن الموضوع لازم يقف.', sound: 'investigation' },
      { at: 3, heading: 'THE\nMISSING YEARS', sub: 'ملف السنين المفقودة', caption: 'وبدأنا تحقيق شامل. استخدمنا مصادر موثوقة.' },
      { at: 6, heading: 'THE\nMISSING YEARS', sub: 'سألنا الشهود. راجعنا الصور.', caption: 'سألنا الشهود… وراجعنا الصور.' },
      { at: 9, heading: 'شهادة الميلاد.', sub: 'THE PAPER TRAIL', caption: 'والأهم… راجعنا شهادة الميلاد.' },
    ] },
  { id: 'evidence', name: 'الأدلة لا تجامل', act: 2, theme: 'case', type: 'evidence', duration: 13,
    eyebrow: 'THE EVIDENCE ROOM', evidence: ['AGE_25', 'POST25_2', 'POST25_4', 'RECENT_PORTRAIT'], beats: [
      { at: 0, heading: 'الأدلة لا تجامل.', sub: 'FOUR PHOTOS. ONE QUESTION.', caption: 'وبعد تحليل البيانات… ومراجعة التواريخ…' },
      { at: 4, heading: 'MATHEMATICS\nDOES NOT LIE.', sub: 'الحساب مش وجهة نظر.', caption: 'والاستعانة بعلم الرياضيات… اللي للأسف مفيهوش مجاملة…' },
      { at: 9, heading: 'D.O.B.\nCONFIRMED', sub: 'وصلنا للحقيقة.', caption: 'وصلنا للحقيقة.', blackout: true },
    ] },
  { id: 'count', name: 'لحظة الحقيقة', act: 2, theme: 'dark', type: 'count', duration: 11,
    eyebrow: 'LET’S COUNT TOGETHER', beats: [
      { at: 0, heading: '25', sub: 'نعدّ سوا؟', caption: 'خمسة وعشرين.', sound: 'click' },
      { at: 2, heading: '26', sub: '', caption: 'ستة وعشرين.', sound: 'click' },
      { at: 4, heading: '27', sub: '', caption: 'سبعة وعشرين.', sound: 'click' },
      { at: 6, heading: '28', sub: '', caption: 'تمانية وعشرين.', sound: 'click' },
      { at: 8, heading: '29', sub: 'أيوه. تسعة وعشرين.', caption: '', sound: 'click' },
      { at: 9, heading: '29', sub: 'أيوه. تسعة وعشرين.', caption: 'أيوه… تسعة وعشرين.' },
    ] },
  { id: 'reveal', name: 'أهلًا بالسنة الجديدة', act: 2, theme: 'reveal', type: 'photo', duration: 13,
    eyebrow: 'OFFICIAL FINDINGS · WITH LOVE', shots: [{ at: 0, role: 'RECENT_PORTRAIT', label: 'THE ONE & ONLY' }], beats: [
      { at: 0, heading: '29', sub: 'YEARS OLD', caption: 'وبكده نأسف لإبلاغك رسميًا…' },
      { at: 3, heading: '29', sub: 'YEARS OLD', caption: 'إن حضرتك النهارده كملتي تسعة وعشرين.' },
      { at: 6, heading: 'YEAR 30', sub: 'ENTERING YOUR 30th YEAR', caption: 'وده معناه… إنك دخلتي السنة التلاتين.' },
      { at: 10, heading: 'أهلًا بيكي.', sub: 'أجمل فصل لسه جاي.', caption: 'أهلًا بيكي.' },
    ] },
  { id: 'club', name: 'مرحبًا في النادي', act: 3, theme: 'warm', type: 'photo', duration: 12,
    eyebrow: 'A MESSAGE FROM YOUR HUSBAND', shots: [
      { at: 0, role: 'HUSBAND', label: 'YOUR VERY RELIABLE WITNESS' }, { at: 2.5, role: 'COUPLE_1', label: 'WE’RE IN THIS TOGETHER' },
      { at: 5, role: 'COUPLE_2', label: 'THE CLUB IS NICE' }, { at: 7, role: 'COUPLE_3', label: 'GOOD COMPANY' }, { at: 9, role: 'COUPLE_4', label: 'KNEES: STILL WORKING' },
    ], beats: [
      { at: 0, heading: 'WELCOME\nTO THE CLUB', sub: 'أنا سبقتك وموجود هنا.', caption: 'أنا عارف إن الخبر صعب. بس متقلقيش.' },
      { at: 3, heading: 'أنا موجود هنا.', sub: 'ومستنيكي.', caption: 'أنا سبقتك وموجود هنا. المكان كويس.' },
      { at: 7, heading: 'والناس محترمة.', sub: 'والركب…', caption: 'والناس محترمة. والركب…' },
      { at: 10, heading: 'لسه شغّالة.', sub: 'الحمد لله.', caption: 'لسه شغالة الحمد لله.', sound: 'click' },
    ] },
  { id: 'roast', name: 'التسوية الودية', act: 3, theme: 'case', type: 'photo', duration: 8,
    eyebrow: 'AN AMICABLE SETTLEMENT', shots: [{ at: 0, role: 'FUNNY_PHOTO', label: 'APPROVAL STILL PENDING' }], beats: [
      { at: 0, heading: '25', sub: 'عشان منبوظش اليوم…', caption: 'بس عشان منبوظش اليوم… ممكن نعتبر إنك خمسة وعشرين.' },
      { at: 2.7, heading: '25 PRO', sub: '', caption: 'بس Version 5.', sound: 'click' },
      { at: 4, heading: '25 PRO MAX', sub: '', caption: '', sound: 'click' },
      { at: 5.5, heading: '25 — SEASON 5', sub: 'النسخة الأحلى لحد دلوقتي.', caption: '', sound: 'click' },
    ] },
  { id: 'love', name: 'بعيدًا عن الهزار', act: 3, theme: 'romantic', type: 'photo', duration: 17,
    eyebrow: 'NO MORE CASE FILES. JUST US.', shots: [
      { at: 0, role: 'COUPLE_1', label: 'ALL OUR LITTLE MOMENTS' }, { at: 3, role: 'COUPLE_2', label: 'EVERY YEAR' },
      { at: 6, role: 'COUPLE_3', label: 'A LITTLE MORE LOVE' }, { at: 9, role: 'COUPLE_4', label: 'ALWAYS YOU' }, { at: 11, role: 'COUPLE_FINAL', label: 'MY FAVORITE FOREVER' },
    ], beats: [
      { at: 0, heading: 'بعيدًا عن الهزار…', sub: '', caption: 'بس بعيدًا عن الهزار… خمسة وعشرين أو تسعة وعشرين…' },
      { at: 4, heading: 'الرقم بيتغيّر.', sub: 'وإنتِ لسه إنتِ.', caption: 'أو حتى لما تبقي سبعين وتفضلي مصممة إنك خمسة وعشرين…' },
      { at: 8.5, heading: 'أنا كل سنة\nبحبك أكتر.', sub: 'من السنة اللي قبلها.', caption: 'أنا كل سنة بحبك أكتر من السنة اللي قبلها.' },
      { at: 12.5, heading: 'أحلى حاجة\nحصلتلي.', sub: 'Happy birthday, my love.', caption: 'وكل سنة وإنتِ أحلى حاجة حصلتلي. Happy Birthday, my love.' },
    ] },
  { id: 'credits', name: 'كل سنة وإنتِ حبيبتي', act: 3, theme: 'dark', type: 'credits', duration: 10,
    eyebrow: 'WITH ALL MY LOVE', beats: [
      { at: 0, heading: 'HAPPY 25th\nBIRTHDAY', sub: '♡', caption: '' },
      { at: 1.5, heading: 'HAPPY 25th\nBIRTHDAY', sub: 'SEASON 5', caption: '' },
      { at: 4, heading: 'HAPPY 25th\nBIRTHDAY', sub: 'SEASON 5', caption: 'Official records may suggest otherwise.' },
      { at: 6, heading: 'WELCOME TO\nYOUR 30th YEAR', sub: 'بداية فصل جديد… سوا.', caption: '' },
    ] },
  { id: 'blackout', name: 'لحظة هدوء', act: 3, theme: 'dark', type: 'black', duration: 1,
    eyebrow: '', beats: [{ at: 0, heading: '', sub: '', caption: '' }] },
  { id: 'post-credit', name: 'بعد التتر', act: 3, theme: 'case', type: 'photo', duration: 6,
    eyebrow: 'POST-CREDITS · ONE LAST THING', shots: [{ at: 0, role: 'FUNNY_PHOTO', label: 'NO HUSBANDS WERE HARMED. YET.' }], beats: [
      { at: 0, heading: 'APPROVED BY\nABSOLUTELY NOBODY.', sub: 'الموافقة لسه ما وصلتش.', caption: '', sound: 'record-scratch' },
      { at: 3, heading: 'HUSBAND’S STATUS:\nMISSING.', sub: 'لو حد شافني… ما يقولش.', caption: '' },
    ] },
];

let nextStart = 0;
export const STORY = scenes.map(scene => {
  const result = { ...scene, start: nextStart, end: nextStart + scene.duration };
  nextStart = result.end;
  return result;
});
export const TOTAL_DURATION = nextStart;
export const ACTS = { 1: 'الفصل الأول · أول الحكاية', 2: 'الفصل الثاني · السنين المفقودة', 3: 'الفصل الثالث · بكل الحب' };
export function getMoment(seconds) {
  const time = Math.max(0, Math.min(seconds, TOTAL_DURATION - 0.001));
  const sceneIndex = STORY.findIndex(scene => time < scene.end);
  const scene = STORY[sceneIndex];
  const localTime = time - scene.start;
  const beatIndex = scene.beats.findLastIndex(beat => localTime >= beat.at);
  const shotIndex = (scene.shots ?? []).findLastIndex(shot => localTime >= shot.at);
  return { scene, sceneIndex, localTime, beatIndex, shotIndex };
}
export function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
