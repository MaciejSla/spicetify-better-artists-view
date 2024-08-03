import { useResizeObserver, useLocalStorage } from "usehooks-ts";
import { Response, ResponseItem } from "../types/fetch";
import React, { useRef, useState, useEffect } from "react";
import { delegate } from "tippy.js";

const LOCAL_STORAGE_PREFIX = "better-artists";

export default function MainView() {
  const el = document.querySelector<HTMLElement>(".Root__main-view");
  const refMain = useRef<HTMLElement>(el);
  const { height: hMain = 0, width: wMain = 0 } = useResizeObserver({
    ref: refMain,
  });

  const mainContentPosition = { height: hMain - 65, top: 65 };

  // const refHeader = useRef<HTMLDivElement>(null);
  // const { height: hHeader = 0 } = useResizeObserver({
  //   ref: refHeader,
  // });

  const [isFetching, setIsFetching] = useState(true);
  const [artists, setArtists, removeArtists] = useLocalStorage<string[]>(
    `${LOCAL_STORAGE_PREFIX}:artists`,
    [],
  );

  // TODO figure out a better way to cache data
  const [albums, setAlbums, removeAlbums] = useLocalStorage<ResponseItem[]>(
    `${LOCAL_STORAGE_PREFIX}:albums`,
    [],
  );

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
    const artist = new URLSearchParams(
      Spicetify.Platform.History.location.search,
    ).get("artist");
    if (artist) setFilteredAlbums(getAlbumsByArtist(artist));
    else setFilteredAlbums([]);
  }, [Spicetify.Platform.History.location.search]);

  const setArtist = (artist: string) => {
    Spicetify.Platform.History.push(`/better-artists/?artist=${artist}`);
  };

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
    setAlbums(state);
    setArtists(artists);
  }, [isFetching]);

  delegate("#tippy-root", {
    target: "[data-tippy-content]",
    ...Spicetify.TippyProps,
  });

  return (
    <div className="relative flex h-full w-full flex-col items-start gap-6">
      {/* TODO: figure out how to have a header without weird scroll */}
      {/* <div className="px-10 text-5xl" ref={refHeader}>
          Better Artists View
        </div> */}
      <div className="flex w-full flex-row-reverse items-start">
        <div
          className="absolute left-0 flex w-1/4 cursor-pointer overflow-auto"
          style={mainContentPosition}
        >
          <div className="flex w-full flex-col gap-1">
            {artists.map((artist) => (
              <button
                key={artist}
                className="rounded-md p-3 text-start hover:bg-[#1f1f1f]"
                onClick={() => setArtist(artist)}
              >
                {artist}
              </button>
            ))}
          </div>
        </div>
        <div
          className="absolute flex h-full w-3/4 flex-col gap-4 overflow-auto p-10"
          style={mainContentPosition}
        >
          <div className="text-3xl">Albums count: {albums.length}</div>
          <div>Width: {wMain}</div>
          <div
            id="tippy-root"
            className={`grid items-start ${
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
                className="rounded-md p-4 hover:bg-[#1f1f1f]"
              >
                <a href={album.album.uri}>
                  <img
                    src={album.album.images ? album.album.images[1].url : ""}
                    alt={album.album.name}
                    className="aspect-square w-full"
                  />
                </a>
                <div className="flex w-full items-start justify-between gap-4">
                  <a
                    href={album.album.uri}
                    data-tippy-content={album.album.name}
                    className="line-clamp-2 text-base text-white"
                  >
                    {album.album.name}
                  </a>
                  <h3
                    data-tippy-content={Spicetify.Locale.formatDate(
                      new Date(album.album.release_date),
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  >
                    {new Date(album.album.release_date).getFullYear()}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
