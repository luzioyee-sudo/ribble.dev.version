import { YoutubeTranscript } from 'youtube-transcript';
YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ').then(res => {
  console.log(JSON.stringify(res.slice(0, 3)));
}).catch(console.error);
