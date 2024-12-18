import { useResizeObserver, useLocalStorage, useBoolean } from "usehooks-ts";
import type {
  ResponseArtist,
  AlbumArtist,
  Artist,
  Response,
  ResponseItem,
} from "../types/fetch";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { delegate } from "tippy.js";
import { getCurrentArtist, getAlbumsByArtist } from "../utils/fetchHelpers";
import { cn } from "../utils/general";
import { Icon } from "./icon";
import fuzzysort from "fuzzysort";
import { CustomAlbumCard } from "./custom-album-card";

const LOCAL_STORAGE_PREFIX = "better-artists";
const ALBUM_FETCH_URL = "https://api.spotify.com/v1/me/albums?limit=50";
const ARTIST_FETCH_URL = "https://api.spotify.com/v1/artists?ids=";
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
  const {
    value: isCustom,
    setTrue: setCustom,
    setFalse: setPremade,
    toggle,
  } = useBoolean(false);
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

  // ? Is this anything?
  // const [currentArtist, setCurrentArtist, removeCurrentArtist] =
  //   useLocalStorage<string>(
  //     `${LOCAL_STORAGE_PREFIX}:currentArtist`,
  //     artists[0]?.name ?? "",
  //   );

  const [filteredAlbums, setFilteredAlbums] = useState<ResponseItem[]>([]);

  const currentArtist = useMemo(
    () => getCurrentArtist(),
    [Spicetify.Platform.History.location.search],
  );

  useEffect(() => {
    console.log(currentArtist);

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
    Spicetify.Platform.History.push(
      `/better-artists/?artist=${encodeURIComponent(artist)}`,
    );
    console.log(getAlbumsByArtist(artist, albums));
  };

  // * Dev only, remove later
  const clearArtist = () => {
    Spicetify.Platform.History.push("/better-artists/");
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
          // console.log(data);
        })
        .catch((error) => {
          console.log(error);
          Spicetify.showNotification("Error fetching albums", true);
        });
    } else {
      setIsFetching(false);
    }
  }, [url]);

  useEffect(() => {
    if (isFetching) return;
    const artists: AlbumArtist[] = Array.from(
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
    const artistIds = artists.map((a) => a.id);
    const artistsLen = artistIds.length;
    let artistFetchUrls = [];
    for (let i = 0; i < artistsLen; i += 50) {
      artistFetchUrls.push(
        ARTIST_FETCH_URL + artistIds.slice(i, i + 50).join(","),
      );
    }
    Promise.all(artistFetchUrls.map((url) => fetch(url, opts)))
      .then((values) => {
        return Promise.all(values.map((val) => val.json()));
      })
      .then((data: { artists: ResponseArtist[] }[]) => {
        const artists: Artist[] = data
          .map((d) => d.artists)
          .flat()
          .map((artist) => ({
            id: artist.id,
            name: artist.name,
            imageUrl: artist.images.at(-1)!,
            uri: artist.uri,
            type: artist.type,
          }));
        setArtists(artists);
      })
      .catch((error) => {
        console.log(error);
        Spicetify.showNotification("Error fetching artist images", true);
        setArtists(
          artists.map((artist) => ({
            ...artist,
            imageUrl: {
              url: "https://media.tenor.com/DFfCL02_DCcAAAAM/cat-look.gif",
              width: 0,
              height: 0,
            },
          })),
        );
      });
    setAlbums(state);
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
            <Icon
              name="search"
              className="size-7 fill-spice-subtext transition-colors group-focus-within:fill-spice-text group-hover:fill-spice-text"
            />
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
          <div className="relative flex w-full flex-col overflow-auto">
            {filteredArtists.map((result) => (
              <button
                id={`${result.target}-ref`}
                key={result.target}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-2 rounded-md p-3 text-start",
                  wMain <= 740 && "flex-col justify-center text-center",
                )}
                onClick={() => setArtist(result.target)}
              >
                <img
                  src={result.obj.imageUrl.url}
                  alt={result.obj.name}
                  className="z-20 size-10 rounded-full object-cover"
                />
                <span
                  className={cn("z-20", wMain <= 500 && "line-clamp-2")}
                  dangerouslySetInnerHTML={{
                    __html: result.highlight(
                      '<span class="font-bold text-spice-text">',
                      "</span>",
                    ),
                  }}
                ></span>
                <div
                  className={cn(
                    "absolute right-0 top-0 z-0 flex size-full scale-90 rounded-md transition-all duration-300 ease-ease group-hover:scale-100 group-hover:bg-spice-card",
                    result.target === currentArtist &&
                      "scale-100 bg-spice-card text-spice-text group-hover:bg-spice-selected-row/30",
                  )}
                ></div>
              </button>
            ))}
          </div>
        </div>
        <div
          className="absolute flex h-full w-3/4 flex-col gap-4 overflow-auto px-10 pb-6"
          style={mainContentPosition}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-3xl">
              Albums count: {albums.length}
              {/* TODO - placeholder, replace with spinner later */}
              {isFetching ? (
                <Icon
                  name="spotify"
                  className="size-6 animate-spin fill-white"
                />
              ) : (
                <div className="size-6"></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Spicetify.ReactComponent.ButtonPrimary onClick={setCustom}>
                Set Custom
              </Spicetify.ReactComponent.ButtonPrimary>
              <Spicetify.ReactComponent.ButtonPrimary onClick={setPremade}>
                Set Premade
              </Spicetify.ReactComponent.ButtonPrimary>
            </div>
            <button
              className="rounded-full px-3 py-1 font-bold ring-1 ring-spice-subtext hover:scale-105 hover:text-spice-text hover:ring-spice-text"
              type="button"
              onClick={clearArtist}
            >
              Clear artist
            </button>
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
            className={cn(
              "grid grid-cols-1 items-start",
              wMain > 650 && "grid-cols-2",
              wMain > 850 && "grid-cols-3",
              wMain > 1100 && "grid-cols-4",
            )}
          >
            {filteredAlbums.length == 0
              ? COLORS.map((color) => (
                  <div
                    className={`${color} flex aspect-square size-full items-center justify-center py-20`}
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
            {filteredAlbums.map((album) =>
              isCustom ? (
                <CustomAlbumCard album={album.album}></CustomAlbumCard>
              ) : (
                <Spicetify.ReactComponent.Cards.Album
                  name={album.album.name}
                  artists={album.album.artists}
                  images={album.album.images! ?? []}
                  uri={album.album.uri}
                  year={new Date(album.album.release_date).getFullYear()}
                ></Spicetify.ReactComponent.Cards.Album>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
