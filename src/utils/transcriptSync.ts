import type { Transcript, TranscriptSegment, TranscriptWord } from '../types/transcript';

const EPSILON = 0.05;

export function normalizeTranscript(raw: any, videoId: string): Transcript {
  if (!raw) {
    throw new Error(`No transcript data received for ${videoId}.`);
  }

  // Handle case where raw is an array of segments or an object containing segments/transcript
  const source = Array.isArray(raw)
    ? { segments: raw }
    : (raw.segments ? raw : (raw.transcript ? { ...raw, segments: raw.transcript } : raw));

  const rawSegments = source.segments ?? source.events ?? [];
  
  const segments: TranscriptSegment[] = rawSegments
    .map((item: any, index: number) => {
      // Support various timestamp structures:
      // startTime / endTime, start / end, offset / duration, tStartMs / dDurationMs
      let startTime = 0;
      let endTime = 0;

      if (item.startTime !== undefined) {
        startTime = Number(item.startTime);
      } else if (item.start !== undefined) {
        startTime = Number(item.start);
      } else if (item.offset !== undefined) {
        startTime = Number(item.offset) / 1000;
      } else if (item.tStartMs !== undefined) {
        startTime = Number(item.tStartMs) / 1000;
      }

      if (item.endTime !== undefined) {
        endTime = Number(item.endTime);
      } else if (item.end !== undefined) {
        endTime = Number(item.end);
      } else if (item.duration !== undefined) {
        endTime = startTime + (Number(item.duration) > 100 ? Number(item.duration) / 1000 : Number(item.duration));
      } else if (item.dDurationMs !== undefined) {
        endTime = startTime + Number(item.dDurationMs) / 1000;
      } else {
        endTime = startTime + 3.0; // Sensible default span
      }

      // Handle text: from item.text or item.segs
      let text = String(item.text ?? '').trim();
      if (!text && Array.isArray(item.segs)) {
        text = item.segs
          .map((s: any) => String(s.utf8 ?? ''))
          .join('')
          .replace(/\s+/g, ' ')
          .trim();
      }

      const words: TranscriptWord[] | undefined = Array.isArray(item.words)
        ? item.words
            .map((word: any, wordIndex: number) => ({
              id: String(word.id ?? `${index}-word-${wordIndex}`),
              text: String(word.text ?? word.word ?? '').trim(),
              startTime: Number(word.startTime ?? word.start ?? (word.offset ? word.offset / 1000 : startTime)),
              endTime: Number(word.endTime ?? word.end ?? (word.duration ? (word.startTime ?? startTime) + word.duration : endTime)),
            }))
            .filter((word: TranscriptWord) =>
              word.text.length > 0 &&
              Number.isFinite(word.startTime) &&
              Number.isFinite(word.endTime) &&
              word.startTime >= 0 &&
              word.endTime >= word.startTime
            )
        : undefined;

      return {
        id: String(item.id ?? item.line_id ?? `segment-${index}`),
        text,
        startTime,
        endTime,
        speaker: item.speaker ? String(item.speaker) : undefined,
        words: words?.length ? words : undefined,
      };
    })
    .filter((segment: TranscriptSegment) =>
      segment.text.length > 0 &&
      Number.isFinite(segment.startTime) &&
      Number.isFinite(segment.endTime) &&
      segment.startTime >= 0 &&
      segment.endTime > segment.startTime
    )
    .sort((a: TranscriptSegment, b: TranscriptSegment) => a.startTime - b.startTime);

  if (!segments.length) {
    throw new Error(`Transcript for this video contains no valid timestamped segments.`);
  }

  return {
    videoId,
    version: Number(source.version ?? 1),
    language: String(source.language ?? 'en'),
    timebase: 'absolute-video-seconds',
    alignmentMethod: source.alignmentMethod ?? 'caption-segment',
    alignmentQuality: source.alignmentQuality ?? 'medium',
    duration: Number.isFinite(Number(source.duration)) ? Number(source.duration) : undefined,
    generatedAt: source.generatedAt ?? new Date().toISOString(),
    segments,
  };
}

/** Returns -1 during intro, silence, music, outro, or any other transcript gap. */
export function findActiveSegmentIndex(
  segments: TranscriptSegment[],
  currentTime: number,
): number {
  if (!Number.isFinite(currentTime) || !segments.length) return -1;

  let low = 0;
  let high = segments.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const segment = segments[middle];

    if (currentTime < segment.startTime) {
      high = middle - 1;
    } else if (currentTime >= segment.endTime) {
      low = middle + 1;
    } else {
      return middle;
    }
  }

  return -1;
}

export function findActiveWordIndex(
  words: TranscriptWord[] | undefined,
  currentTime: number,
): number {
  if (!words?.length || !Number.isFinite(currentTime)) return -1;
  let low = 0;
  let high = words.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const word = words[middle];
    if (currentTime < word.startTime) high = middle - 1;
    else if (currentTime >= word.endTime) low = middle + 1;
    else return middle;
  }
  return -1;
}

export function isWithinDuration(segment: TranscriptSegment, duration?: number): boolean {
  return duration === undefined || (
    segment.startTime <= duration + EPSILON &&
    segment.endTime <= duration + EPSILON
  );
}

export function toAbsoluteVideoSeconds(localSeconds: number, originalStartTime: number): number {
  if (!Number.isFinite(localSeconds) || !Number.isFinite(originalStartTime) || originalStartTime < 0) {
    throw new Error('Invalid local timestamp or original media origin.');
  }
  return originalStartTime + localSeconds;
}
