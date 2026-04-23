/**
 * playlistService.js — Supabase CRUD for playlists
 *
 * All operations take a userId (Spotify user ID) so data is scoped
 * per user even though we use the anon key.
 */

import supabase from './supabaseClient';

// ── Fetch all playlists (with songs) for a user ───────────────────────────────
export async function fetchPlaylists(userId) {
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_songs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id:    p.id,
    name:  p.name,
    songs: (p.playlist_songs ?? [])
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        id:         s.song_id,
        title:      s.title,
        artist:     s.artist,
        album:      s.album   ?? '',
        albumArt:   s.album_art ?? null,
        duration:   s.duration  ?? 0,
        spotifyUrl: s.spotify_url ?? null,
      })),
  }));
}

// ── Create a playlist ─────────────────────────────────────────────────────────
export async function createPlaylist(userId, id, name) {
  const { error } = await supabase
    .from('playlists')
    .insert({ id, user_id: userId, name });
  if (error) throw error;
}

// ── Rename a playlist ─────────────────────────────────────────────────────────
export async function renamePlaylist(id, name) {
  const { error } = await supabase
    .from('playlists')
    .update({ name })
    .eq('id', id);
  if (error) throw error;
}

// ── Delete a playlist (cascade removes songs) ────────────────────────────────
export async function deletePlaylist(id) {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Add a song to a playlist ──────────────────────────────────────────────────
export async function addSongToPlaylist(playlistId, userId, song, position) {
  const { error } = await supabase
    .from('playlist_songs')
    .upsert({
      playlist_id: playlistId,
      user_id:     userId,
      song_id:     song.id,
      title:       song.title,
      artist:      song.artist,
      album:       song.album      ?? '',
      album_art:   song.albumArt   ?? null,
      duration:    song.duration   ?? 0,
      spotify_url: song.spotifyUrl ?? null,
      position,
    });
  if (error) throw error;
}

// ── Remove a song from a playlist ────────────────────────────────────────────
export async function removeSongFromPlaylist(playlistId, songId) {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId);
  if (error) throw error;
}
