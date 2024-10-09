import React from "react";
import type { Album } from "../types/fetch";

export function CustomAlbumCard(album: Album) {
  return (
    <a
      href={album.uri}
      key={album.id}
      className="group relative flex h-full flex-col gap-1 rounded-md p-4 hover:no-underline"
    >
      <img
        src={album.images ? album.images[1]?.url : ""}
        alt={album.name}
        className="z-30 aspect-square w-full rounded-md shadow-lg"
      />
      <div className="z-30 flex flex-col gap-1">
        <div
          data-tippy-content={album.name}
          className="line-clamp-1 text-base text-spice-text hover:underline"
        >
          {album.name}
        </div>
        <h3
          data-tippy-content={Spicetify.Locale.formatDate(
            new Date(album.release_date),
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          )}
        >
          {new Date(album.release_date).getFullYear()}
        </h3>
      </div>
      <div className="ease-ease absolute right-0 top-0 z-0 flex size-full scale-90 rounded-md transition-all duration-300 group-hover:scale-100 group-hover:bg-spice-main-elevated"></div>
    </a>
  );
}
