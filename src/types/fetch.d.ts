export type Artist = Spicetify.ArtistsEntity & { id: string };

export type Album = Spicetify.Album & {
  id: string;
  artists: Artist[];
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
