import "./css/output.css";
import React from "react";

import { useResizeObserver } from "usehooks-ts";

function App() {
  const el = document.querySelector<HTMLElement>(".Root__main-view");
  const ref = React.useRef<HTMLElement>(el);
  const { width = 0, height = 0 } = useResizeObserver({
    ref,
  });

  const [isFetching, setIsFetching] = React.useState(true);
  const [artists, setArtists] = React.useState<string[]>(
    JSON.parse(Spicetify.LocalStorage.get("artists")!) || [],
  );

  // TODO figure out a better way to cache data
  const [albums, setAlbums] = React.useState<
    {
      added_at: string;
      album: Spicetify.Album & {
        artists: Spicetify.ArtistsEntity[];
      };
    }[]
  >(JSON.parse(Spicetify.LocalStorage.get("better-artists")!) || []);

  const opts = {
    headers: {
      Authorization: "Bearer " + Spicetify.Platform.Session.accessToken,
    },
  };

  const [state, setState] = React.useState<
    {
      added_at: string;
      album: Spicetify.Album & {
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
    <div className="flex h-full w-full flex-col items-start gap-6 pt-10">
      <div className="px-10 text-5xl">Better Artists View</div>
      <div className="relative flex w-full flex-row-reverse items-start">
        <div className="absolute left-0 flex h-min w-1/4 cursor-pointer overflow-auto">
          <div className="flex w-full flex-col">
            {artists.map((artist) => (
              <div key={artist} className="p-4 hover:bg-white/20">
                {artist}
              </div>
            ))}
          </div>
        </div>
        <div className="flex h-full w-3/4 flex-col gap-4 bg-blue-900 p-10">
          <div className="text-3xl">Albums count: {albums.length}</div>
          <a href={albums[0]?.album?.uri}>
            {JSON.stringify(albums[0]?.album?.uri)}
          </a>
          <h1 className="text-3xl">Width: {width}</h1>
          <h1 className="text-3xl">Height: {height}</h1>
          <Spicetify.ReactComponent.ButtonPrimary>
            asdasd
          </Spicetify.ReactComponent.ButtonPrimary>
          <Spicetify.ReactComponent.Menu>
            <Spicetify.ReactComponent.MenuItem>
              adadas
            </Spicetify.ReactComponent.MenuItem>
          </Spicetify.ReactComponent.Menu>
          <Spicetify.ReactComponent.PlaylistMenu></Spicetify.ReactComponent.PlaylistMenu>
        </div>
      </div>
    </div>
  );
}

export default App;
