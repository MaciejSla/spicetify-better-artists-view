// TODO clean up type names, cannot be bothered rn

export type AlbumArtist = Spicetify.ArtistsEntity & {
  id: string;
};

export type ArtistImage = {
  url: string;
  height: number;
  width: number;
};

export type ResponseArtist = AlbumArtist & {
  externalUrls: { spotify: string };
  followers: { href: null; total: number };
  genres: string[];
  href: string;
  images: ArtistImage[];
  popularity: number;
};

export type Artist = AlbumArtist & {
  imageUrl: ArtistImage;
};

export type Album = Spicetify.Album & {
  id: string;
  artists: AlbumArtist[];
  release_date: string;
};

export type ResponseItem = {
  added_at: string;
  album: Album;
};

export type Response = {
  items: ResponseItem[];
  next: string | null;
  limit: number;
  offset: number;
  total: number;
};
