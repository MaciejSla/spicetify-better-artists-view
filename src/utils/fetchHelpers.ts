import type { ResponseItem } from "../types/fetch";

export const getCurrentArtist = () => {
  const artistRaw = new URLSearchParams(
    Spicetify.Platform.History.location.search,
  ).get("artist");

  const artist = decodeURIComponent(artistRaw ?? "");

  return artist;
};

export const getAlbumsByArtist = (artist: string, albums: ResponseItem[]) => {
  return albums
    .filter((album) => album.album.artists.map((a) => a.name).includes(artist))
    .sort(
      (a, b) =>
        new Date(b.album.release_date).getTime() -
        new Date(a.album.release_date).getTime(),
    );
};
