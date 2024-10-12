import React from "react";
import type { Album } from "../types/fetch";

export function CustomAlbumCard({ album }: { album: Album }) {
  return (
    <a
      href={album.uri}
      key={album.id}
      className="group relative flex h-full flex-col gap-2 rounded-md p-3 !no-underline"
    >
      <div
        className="relative z-30 aspect-square overflow-hidden rounded-md"
        style={{ boxShadow: "0 8px 24px rgba(var(--spice-rgb-shadow),.5)" }}
      >
        <img
          src={album.images ? album.images[1]?.url : ""}
          alt={album.name}
          className="aspect-square w-full object-cover object-center"
        />
      </div>
      <div className="z-30 flex flex-col gap-1">
        <div
          data-tippy-content={album.name}
          className="line-clamp-2 text-base text-spice-text hover:underline"
        >
          {album.name}
        </div>
        <div className="line-clamp-1 inline-block text-sm text-spice-subtext">
          <time
            className="inline"
            data-tippy-content={Spicetify.Locale.formatDate(
              new Date(album.release_date),
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              },
            )}
            dateTime={album.release_date}
          >
            {new Date(album.release_date).getFullYear()}
          </time>
          {" • "}
          {album.artists.map((artist, index) => (
            <React.Fragment key={artist.name}>
              <a className="inline !text-spice-subtext" href={artist.uri}>
                {artist.name}
              </a>
              {index !== album.artists.length - 1 && ", "}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-0 z-0 flex size-full scale-90 rounded-md transition-all duration-300 ease-ease group-hover:scale-100 group-hover:bg-spice-main-elevated"></div>
    </a>
  );
}
