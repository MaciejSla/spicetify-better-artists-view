import "./css/output.css";
import React from "react";

function App() {
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 overflow-auto p-10">
      {/* <div className="text-5xl">My Custom App!</div> */}
      <div className="relative grid w-full grid-cols-[25%,75%] items-start overflow-auto">
        <div className="flex max-h-[72vh] cursor-pointer flex-col overflow-auto">
          {artists.map((artist) => (
            <div key={artist} className="p-4 hover:bg-white/20">
              {artist}
            </div>
          ))}
        </div>
        <div className="sticky flex w-full flex-col gap-4 bg-blue-400">
          <div className="text-3xl">Albums count: {albums.length}</div>
          <a href={albums[0]?.album?.uri}>
            {JSON.stringify(albums[0]?.album?.uri)}
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
