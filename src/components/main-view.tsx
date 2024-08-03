import { useResizeObserver } from "usehooks-ts";
import { Response, ResponseItem } from "../types/fetch";
import React, { useRef, useState, useEffect } from "react";

export default function MainView() {
  const el = document.querySelector<HTMLElement>(".Root__main-view");
  const refMain = useRef<HTMLElement>(el);
  const { height: hMain = 0, width: wMain = 0 } = useResizeObserver({
    ref: refMain,
  });

  // const mainStyle = { height: hMain - 65, top: 65 };

  // const refHeader = useRef<HTMLDivElement>(null);
  // const { height: hHeader = 0 } = useResizeObserver({
  //   ref: refHeader,
  // });

  const [isFetching, setIsFetching] = useState(true);
  const [artists, setArtists] = useState<string[]>(
    JSON.parse(Spicetify.LocalStorage.get("artists")!) || [],
  );

  // TODO figure out a better way to cache data
  const [albums, setAlbums] = useState<ResponseItem[]>(
    JSON.parse(Spicetify.LocalStorage.get("better-artists")!) || [],
  );

  const [selectedArtist, setSelectedArtist] = useState<string>("");

  const [filteredAlbums, setFilteredAlbums] = useState<ResponseItem[]>([]);

  const getAlbumsByArtist = (artist: string) => {
    return albums
      .filter(
        (album) => album.album.artists.map((a) => a.name).join(", ") === artist,
      )
      .sort(
        (a, b) =>
          new Date(b.album.release_date).getTime() -
          new Date(a.album.release_date).getTime(),
      );
  };

  useEffect(() => {
    if (selectedArtist === "") return;
    setFilteredAlbums(getAlbumsByArtist(selectedArtist));
  }, [selectedArtist]);

  const opts = {
    headers: {
      Authorization: "Bearer " + Spicetify.Platform.Session.accessToken,
    },
  };

  const [state, setState] = useState<ResponseItem[]>([]);
  const [url, setUrl] = useState<string | null>(
    "https://api.spotify.com/v1/me/albums?limit=50",
  );

  useEffect(() => {
    if (url) {
      fetch(url, opts)
        .then((response) => {
          return response.json();
        })
        .then((data: Response) => {
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

  useEffect(() => {
    if (isFetching) return;
    const artists: string[] = Array.from(
      new Set(
        // TODO try to make artist grouping more customizable
        // state.map((item) => {
        //   const artists = item.album.artists.map((a) => a as Artist);
        //   console.log("Artists", artists);
        //   return item.album.artists[0].name;
        // }),
        state.map((item) => item.album.artists.map((a) => a.name).join(", ")),
      ),
    ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    Spicetify.LocalStorage.set("artists", JSON.stringify(artists));
    Spicetify.LocalStorage.set("better-artists", JSON.stringify(state));
    setAlbums(state);
    setArtists(artists);
  }, [isFetching]);

  // TODO figure out why this needs a double click on artist to work
  Spicetify.Tippy("[data-tippy-content]", Spicetify.TippyProps);

  return (
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
          <div>Width: {wMain}</div>
          <div
            className={`grid items-start gap-6 ${
              wMain > 1100
                ? "grid-cols-4"
                : wMain > 850
                  ? "grid-cols-3"
                  : wMain > 650
                    ? "grid-cols-2"
                    : "grid-cols-1"
            }`}
          >
            {filteredAlbums.map((album) => (
              <div
                key={album.album.id}
                className="group"
                data-tippy-content={album.album.name}
              >
                <a href={album.album.uri}>
                  <img
                    src={album.album.images ? album.album.images[1].url : ""}
                    alt={album.album.name}
                    className="aspect-square w-full"
                  />
                </a>
                <div className="flex w-full items-start justify-between">
                  <a
                    href={album.album.uri}
                    className="line-clamp-2 text-lg text-white group-hover:underline"
                  >
                    {album.album.name}
                  </a>
                  <h3>{new Date(album.album.release_date).getFullYear()}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
