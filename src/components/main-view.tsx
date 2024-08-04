import { useResizeObserver, useLocalStorage } from "usehooks-ts";
import { Artist, Response, ResponseItem } from "../types/fetch";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { delegate } from "tippy.js";
import { getCurrentArtist, getAlbumsByArtist } from "../utils/fetchHelpers";
import { cn } from "../utils/general";
import { SearchIcon } from "./icons";
import fuzzysort from "fuzzysort";

export const LOCAL_STORAGE_PREFIX = "better-artists";
export const ALBUM_FETCH_URL = "https://api.spotify.com/v1/me/albums?limit=50";
const COLORS = [
  "bg-spice-text",
  "bg-spice-subtext",
  "bg-spice-main",
  "bg-spice-main-elevated",
  "bg-spice-highlight",
  "bg-spice-highlight-elevated",
  "bg-spice-sidebar",
  "bg-spice-player",
  "bg-spice-card",
  "bg-spice-shadow",
  "bg-spice-selected-row",
  "bg-spice-button",
  "bg-spice-button-active",
  "bg-spice-button-disabled",
  "bg-spice-tab-active",
  "bg-spice-notification",
  "bg-spice-notification-error",
  "bg-spice-misc",
];

export default function MainView() {
  const el = document.querySelector<HTMLElement>(".Root__main-view");
  const refMain = useRef<HTMLElement>(el);
  const { height: hMain = 0, width: wMain = 0 } = useResizeObserver({
    ref: refMain,
  });

  const mainContentPosition = { height: hMain - 65, top: 65 };

  const [isFetching, setIsFetching] = useState(true);
  const [artists, setArtists, removeArtists] = useLocalStorage<Artist[]>(
    `${LOCAL_STORAGE_PREFIX}:artists`,
    [],
  );

  // TODO figure out a better way to cache data
  const [albums, setAlbums, removeAlbums] = useLocalStorage<ResponseItem[]>(
    `${LOCAL_STORAGE_PREFIX}:albums`,
    [],
  );

  const [filteredAlbums, setFilteredAlbums] = useState<ResponseItem[]>([]);

  const currentArtist = useMemo(
    () => getCurrentArtist(),
    [Spicetify.Platform.History.location.search],
  );

  useEffect(() => {
    if (currentArtist) {
      const artist = document.getElementById(`${currentArtist}-ref`);
      artist &&
        artist.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      setFilteredAlbums(getAlbumsByArtist(currentArtist, albums));
    } else setFilteredAlbums([]);
  }, [currentArtist]);

  const setArtist = (artist: string) => {
    Spicetify.Platform.History.push(`/better-artists/?artist=${artist}`);
  };

  const opts = {
    headers: {
      Authorization: "Bearer " + Spicetify.Platform.Session.accessToken,
    },
  };

  const [state, setState] = useState<ResponseItem[]>([]);
  const [url, setUrl] = useState<string | null>(ALBUM_FETCH_URL);

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
          Spicetify.showNotification("Error fetching albums");
        });
    } else {
      setIsFetching(false);
    }
  }, [url]);

  useEffect(() => {
    if (isFetching) return;
    const artists: Artist[] = Array.from(
      new Set(
        // TODO try to make artist grouping customizable
        state
          .map((item) => item.album.artists)
          .flat()
          .map((a) => JSON.stringify(a)),
      ),
    )
      .map((item) => JSON.parse(item))
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    setAlbums(state);
    setArtists(artists);
    if (currentArtist)
      setFilteredAlbums(getAlbumsByArtist(currentArtist, state));
  }, [isFetching]);

  const clearCache = () => {
    removeArtists();
    removeAlbums();
    setState([]);
    setFilteredAlbums([]);
    setIsFetching(true);
    setUrl(ALBUM_FETCH_URL);
  };

  delegate("#tippy-root", {
    target: "[data-tippy-content]",
    ...Spicetify.TippyProps,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const onInputFocus = () => {
    inputRef.current?.focus();
  };

  // TODO maybe put this into params as well?
  const [searchValue, setSearchValue] = useState("");
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const filteredArtists = fuzzysort.go(searchValue, artists, {
    all: true,
    key: "name",
  });

  return (
    <div className="relative flex h-full w-full flex-col items-start gap-6 text-spice-subtext">
      <div className="flex w-full flex-row-reverse items-start">
        <div
          className="absolute left-0 flex w-1/4 flex-col gap-2 pl-1"
          style={mainContentPosition}
        >
          {/* TODO: add highlight and scroll to the selected artist */}
          <div
            className="group flex cursor-pointer items-center gap-2 rounded-full bg-spice-main-elevated p-3 ring-1 ring-transparent transition-all focus-within:bg-spice-highlight-elevated focus-within:ring-2 focus-within:!ring-spice-text hover:bg-spice-highlight-elevated hover:ring-spice-misc"
            onClick={onInputFocus}
          >
            <SearchIcon className="size-6 fill-spice-subtext transition-colors group-focus-within:fill-spice-text group-hover:fill-spice-text" />
            <input
              ref={inputRef}
              type="text"
              className="w-full cursor-pointer bg-transparent text-spice-text placeholder-spice-subtext focus:cursor-text"
              placeholder="Search in Artists"
              value={searchValue}
              onChange={onSearchChange}
            />
          </div>
          {/* TODO add custom scrollbar with transitions etc */}
          <div className="relative flex w-full flex-col gap-1 overflow-auto">
            {filteredArtists.map((result) => (
              <button
                id={`${result.target}-ref`}
                key={result.target}
                className={cn(
                  "cursor-pointer rounded-md p-3 text-start hover:bg-spice-card",
                  result.target === currentArtist &&
                    "bg-spice-selected-row/30 text-spice-text hover:bg-spice-selected-row/30",
                )}
                onClick={() => setArtist(result.target)}
              >
                {result.target}
              </button>
            ))}
          </div>
        </div>
        <div
          className="absolute flex h-full w-3/4 flex-col gap-4 overflow-auto px-10 pb-6"
          style={mainContentPosition}
        >
          <div className="flex w-full items-center justify-between">
            <div className="text-3xl">Albums count: {albums.length}</div>
            <button
              className="rounded-full px-3 py-1 font-bold ring-1 ring-spice-subtext hover:scale-105 hover:text-spice-text hover:ring-spice-text"
              type="button"
              onClick={clearCache}
            >
              Clear cache
            </button>
          </div>
          <div>Width: {wMain}</div>
          {filteredAlbums.length == 0 ? (
            <div className="text-xl text-spice-text">Colors cheat sheet</div>
          ) : null}
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
            {filteredAlbums.length == 0
              ? COLORS.map((color) => (
                  <div
                    className={`${color} flex size-full items-center justify-center py-20`}
                    key={color}
                  >
                    <span
                      className={
                        color === "bg-spice-misc"
                          ? "text-black"
                          : "text-white mix-blend-difference"
                      }
                    >
                      {color.slice(3)}
                    </span>
                  </div>
                ))
              : null}
            {filteredAlbums.map((album) => (
              <a
                href={album.album.uri}
                key={album.album.id}
                className="flex h-full flex-col gap-1 rounded-md p-4 hover:bg-spice-highlight hover:no-underline"
              >
                <img
                  src={album.album.images ? album.album.images[1]?.url : ""}
                  alt={album.album.name}
                  className="aspect-square w-full rounded-md"
                />
                <div className="flex flex-col gap-1">
                  <div
                    data-tippy-content={album.album.name}
                    className="line-clamp-1 text-base text-spice-text hover:underline"
                  >
                    {album.album.name}
                  </div>
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
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
