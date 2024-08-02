import "./css/output.css";
import React from "react";

import { useResizeObserver } from "usehooks-ts";

function App() {
  const el = document.querySelector<HTMLElement>(".Root__main-view");
  const refMain = React.useRef<HTMLElement>(el);
  const { height: hMain = 0 } = useResizeObserver({
    ref: refMain,
  });

  // const refHeader = React.useRef<HTMLDivElement>(null);
  // const { height: hHeader = 0 } = useResizeObserver({
  //   ref: refHeader,
  // });

  const [isFetching, setIsFetching] = React.useState(true);
  const [artists, setArtists] = React.useState<string[]>(
    JSON.parse(Spicetify.LocalStorage.get("artists")!) || [],
  );

  // TODO figure out a better way to cache data
  const [albums, setAlbums] = React.useState<
    {
      added_at: string;
      album: Spicetify.Album & {
        id: string;
        artists: Spicetify.ArtistsEntity[];
      };
    }[]
  >(JSON.parse(Spicetify.LocalStorage.get("better-artists")!) || []);

  const [selectedArtist, setSelectedArtist] = React.useState<string>("");

  const [filteredAlbums, setFilteredAlbums] = React.useState<
    {
      added_at: string;
      album: Spicetify.Album & {
        id: string;
        artists: Spicetify.ArtistsEntity[];
      };
    }[]
  >([]);

  const getAlbumsByArtist = (artist: string) => {
    return albums.filter((album) =>
      album.album.artists.map((a) => a.name).includes(artist),
    );
  };

  React.useEffect(() => {
    if (selectedArtist === "") return;
    setFilteredAlbums(getAlbumsByArtist(selectedArtist));
  }, [selectedArtist]);

  const opts = {
    headers: {
      Authorization: "Bearer " + Spicetify.Platform.Session.accessToken,
    },
  };

  const [state, setState] = React.useState<
    {
      added_at: string;
      album: Spicetify.Album & {
        id: string;
        artists: Spicetify.ArtistsEntity[];
      };
    }[]
  >([]);
  const [url, setUrl] = React.useState(
    "https://api.spotify.com/v1/me/albums?limit=50",
  );

  React.useEffect(() => {
    if (url) {
      fetch(url, opts)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setState((state) => state.concat(data.items));
          setUrl(data.next);
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setIsFetching(false);
    }
  }, [url]);

  React.useEffect(() => {
    if (isFetching) return;
    const artists: string[] = Array.from(
      new Set(state.map((item) => item.album.artists[0].name)),
    ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    Spicetify.LocalStorage.set("artists", JSON.stringify(artists));
    Spicetify.LocalStorage.set("better-artists", JSON.stringify(state));
    setAlbums(state);
    setArtists(artists);
  }, [isFetching]);

  return (
    <>
      {/* <div
        className="absolute w-1 bg-red-600"
        style={{ height: hMain - 65, top: 65 }}
      ></div> */}
      <div className="relative flex h-full w-full flex-col items-start gap-6">
        {/* TODO: figure out how to have a header without weird scroll */}
        {/* <div className="px-10 text-5xl" ref={refHeader}>
          Better Artists View
        </div> */}
        <div className="flex w-full flex-row-reverse items-start">
          <div
            className="absolute left-0 flex w-1/4 cursor-pointer overflow-auto"
            style={{ height: hMain - 65, top: 65 }}
          >
            <div className="flex w-full flex-col gap-1">
              {artists.map((artist) => (
                <button
                  key={artist}
                  className="rounded-md p-3 text-start hover:bg-white/20"
                  onClick={() => setSelectedArtist(artist)}
                >
                  {artist}
                </button>
              ))}
            </div>
          </div>
          <div
            className="absolute flex h-full w-3/4 flex-col gap-4 overflow-auto p-10"
            style={{ height: hMain - 65, top: 65 }}
          >
            <div className="text-3xl">Albums count: {albums.length}</div>
            {filteredAlbums.map((album) => (
              <a key={album.album.id} href={album.album.uri}>
                <img src={album.album.images[1].url} alt={album.album.name} />
                <h1>{album.album.name}</h1>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
