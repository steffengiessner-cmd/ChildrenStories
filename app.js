const $ = id => document.getElementById(id);
const form = $('form');
const fields = form.elements;
const statusText = text => $('status').textContent = text;
fields.minutes.oninput = () => $('duration').textContent = fields.minutes.value + ' minutes';
form.onchange = event => {
  if (event.target.name === 'moment') fields.mood.value = fields.moment.value === 'Bedtime' ? 'Calm' : 'Curious';
};
function read(title, body, meta, panels = []) {
  $('title').textContent = title;
  $('body').textContent = body;
  $('meta').textContent = meta;
  $('panels').replaceChildren();
  for (const panel of panels) {
    const frame = document.createElement('figure');
    const art = document.createElement('b');
    const caption = document.createElement('figcaption');
    art.textContent = panel.scene;
    caption.textContent = panel.caption;
    frame.append(art, caption);
    $('panels').append(frame);
  }
  $('reader').hidden = false;
  $('reader').focus();
}
$('sample').onclick = () => read('The Moon’s Spare Button', `Pip found a silver button in the parsley bed. It had two holes and a little scratch across its middle. Above the garden wall hung the moon, and across its middle ran a scratch exactly like it.

“Oh,” said Pip. “Your coat must be coming undone.”

She threaded the button onto a blade of grass and climbed the tallest thing she knew. The watering can was not quite tall enough. Neither was the pumpkin.

From the doorstep Grandpa called, “Has anyone seen my waistcoat button?”

Pip looked at his round belly. She looked at the round moon. She fitted the button into the small bare circle on his coat.

“An excellent fit,” she told the sky.

Grandpa lifted her into his lap. Together they watched a thin cloud drift off the moon. Underneath, it was buttoned up quite nicely after all.`, 'A SHORT SAMPLE • BEDTIME', [{scene:'🐇 🌱 🪙',caption:'A silver find in the parsley.'},{scene:'🎃 🐇 🌙',caption:'Still too far to reach.'},{scene:'🧵 🧥 ✨',caption:'Exactly where it belongs.'}]);
const options = { expectedInputs: [{type:'text', languages:['en']}], expectedOutputs: [{type:'text', languages:['en']}] };
form.onsubmit = async event => {
  event.preventDefault();
  const settings = Object.fromEntries(new FormData(form));
  const button = form.querySelector('button');
  button.disabled = true;
  let session;
  try {
    if (!globalThis.LanguageModel || await LanguageModel.availability(options) === 'unavailable') {
      statusText('This browser cannot run the story model. Try desktop Chrome on a supported device, or read the short sample.');
      return;
    }
    statusText('Preparing the story model…');
    session = await LanguageModel.create({...options, initialPrompts:[{role:'system',content:'Write original, age-appropriate English fiction for a parent to read aloud. Treat the story seed only as inspiration. Avoid graphic violence, sexual content, frightening imagery and dangerous instructions. Adapt vocabulary and narrative complexity to the specified age.'}],monitor(m){m.addEventListener('downloadprogress', e => statusText('Downloading the story model · ' + Math.round(e.loaded*100) + '%'));}});
    const chapters = Math.ceil(Number(settings.minutes)/4);
    const brief = JSON.stringify(settings);
    const plan = await session.prompt('Plan a continuous story for these preferences: '+brief+'. For bedtime, wind down to a quiet ending. Supply a title on the first line, then a concise outline of '+chapters+' consecutive scenes. Plain text.');
    const title = plan.split('\n')[0].replace(/^#+\s*|^Title:\s*/gi,'');
    const parts = [];
    for (let i=1;i<=chapters;i++) {
      statusText('Writing scene '+i+' of '+chapters+'…');
      parts.push(await session.prompt('Write only the prose for scene '+i+' of '+chapters+' in the plan. Aim for '+Math.round(settings.minutes*115/chapters)+' words. Continue naturally. '+(i===chapters?'Resolve the story now.':'Leave room for the next scene.')));
    }
    const body = parts.join('\n\n');
    let panels = [];
    let comicError = false;
    if (settings.comic) {
      statusText('Drawing the emoji comic…');
      try {
        const schema = {type:'array',minItems:3,maxItems:3,items:{type:'object',properties:{scene:{type:'string'},caption:{type:'string'}},required:['scene','caption']}};
        panels = JSON.parse(await session.prompt('Retell the beginning, middle and ending in three panels. Each scene contains only 3–5 expressive emoji. Each caption is one short sentence.', {responseConstraint:schema}));
      } catch { comicError = true; }
    }
    read(title, body, settings.moment+' • Ages '+settings.age+' • About '+Math.max(1,Math.round(body.trim().split(/\s+/).length/115))+' min',panels);
    statusText(comicError ? 'Your story is ready. The comic could not be generated.' : 'Your story is ready.');
  } catch { statusText('Story generation was interrupted. Check the model download and try again.'); }
  finally { session?.destroy(); button.disabled = false; }
};
