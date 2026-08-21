import fetch from 'node-fetch';
(async () => {
  const videoId = 'dQw4w9WgXcQ';
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
  const text = await res.text();
  console.log('length:', text.length);
  if (text.includes('ytInitialPlayerResponse')) {
    console.log('ytInitialPlayerResponse found');
    const match = text.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (match) {
        console.log('matched! parsing...');
        try {
            const parsed = JSON.parse(match[1]);
            console.log('parsed ok, has captions?', !!parsed.captions);
        } catch(e) {
            console.log('parse error', e.message);
        }
    } else {
        console.log('regex did not match');
    }
  } else {
    console.log('ytInitialPlayerResponse NOT found');
  }
})();
