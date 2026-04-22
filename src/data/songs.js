// Sample song data — replace `url` with real .mp3 paths or hosted URLs.
// Thumbnails use picsum.photos as placeholder album art.
const songs = [
  {
    id: 1,
    title: "Golden Hour",
    artist: "JVKE",
    album: "this is what ____ feels like",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnail: "https://picsum.photos/seed/song1/80/80",
    duration: 209,
  },
  {
    id: 2,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    thumbnail: "https://picsum.photos/seed/song2/80/80",
    duration: 200,
  },
  {
    id: 3,
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    thumbnail: "https://picsum.photos/seed/song3/80/80",
    duration: 203,
  },
  {
    id: 4,
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    album: "F*CK LOVE 3",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    thumbnail: "https://picsum.photos/seed/song4/80/80",
    duration: 141,
  },
  {
    id: 5,
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    thumbnail: "https://picsum.photos/seed/song5/80/80",
    duration: 167,
  },
  {
    id: 6,
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    thumbnail: "https://picsum.photos/seed/song6/80/80",
    duration: 238,
  },
  {
    id: 7,
    title: "Shivers",
    artist: "Ed Sheeran",
    album: "=",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    thumbnail: "https://picsum.photos/seed/song7/80/80",
    duration: 207,
  },
  {
    id: 8,
    title: "Peaches",
    artist: "Justin Bieber",
    album: "Justice",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    thumbnail: "https://picsum.photos/seed/song8/80/80",
    duration: 198,
  },
];

// Helper: convert seconds to mm:ss display string
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default songs;
