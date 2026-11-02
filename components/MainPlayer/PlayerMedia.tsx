import { DialogDescription, DialogTitle } from "@headlessui/react";
import { cn } from "cnfast";
import { decode } from "he";
import Image from "next/image";
import type { RefObject, SyntheticEvent } from "react";
import { lazy, useSyncExternalStore } from "react";
import type { PlayerProps, PlayerState } from "@/lib/types";
import {
  get_client_snapshot,
  get_server_snapshot,
  subscribe_hydration,
} from "./utils";

const ReactPlayer = lazy(() => import("react-player"));

type PlayerMediaProps = {
  mediaItem: PlayerProps["mediaItem"];
  state: PlayerState;
  audioRef: RefObject<HTMLVideoElement | null>;
  play_media: () => void;
  pause_media: () => void;
  report_error: () => void;
  update_progress: (event: SyntheticEvent<HTMLVideoElement>) => void;
  load_media: (event: SyntheticEvent<HTMLVideoElement>) => void;
};

// Keep artwork and browser-only playback separate from the modal and controls.
export const PlayerMedia = ({
  mediaItem,
  state,
  audioRef,
  play_media,
  pause_media,
  report_error,
  update_progress,
  load_media,
}: PlayerMediaProps) => {
  const isSSR = useSyncExternalStore(
    subscribe_hydration,
    get_client_snapshot,
    get_server_snapshot,
  );
  const { title, src, imageSrc } = mediaItem;

  return (
    <>
      <div
        className={cn(
          "mx-auto w-full max-w-[min(16rem,32dvh)] px-2 sm:max-w-[min(18rem,36dvh)]",
        )}
      >
        <Image
          src={
            imageSrc
              ? /^https?:\/\//.test(imageSrc)
                ? imageSrc
                : `https://www.paullowe.org/wp-content/uploads/${imageSrc}`
              : "/P1080841.jpg"
          }
          // A public URL avoids a static import's immutable, content-hashed image cache.
          width={imageSrc ? 400 : 700}
          height={imageSrc ? 400 : 700}
          alt=""
          className={cn("aspect-square h-auto w-full rounded-2xl object-cover")}
        />
      </div>
      <DialogTitle
        className={cn(
          "px-6 pt-5 text-center text-xl font-semibold leading-snug tracking-tight text-slate-900",
        )}
      >
        {title ? decode(title) : "Audio talk"}
      </DialogTitle>
      <DialogDescription
        className={cn("px-6 pb-2 pt-2 text-center text-sm text-slate-500")}
      >
        Paul Lowe
        {mediaItem.date
          ? `, ${new Date(mediaItem.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}`
          : ""}
      </DialogDescription>
      {!isSSR && (
        <ReactPlayer
          ref={audioRef}
          style={{ display: "none" }}
          src={src}
          pip={state.pip}
          playing={state.playing}
          controls={state.controls}
          light={state.light}
          loop={state.loop}
          playbackRate={state.playbackRate}
          volume={state.volume}
          muted={state.muted}
          onPlay={play_media}
          onPause={pause_media}
          onEnded={pause_media}
          onError={report_error}
          onTimeUpdate={update_progress}
          onLoadedMetadata={load_media}
        />
      )}
    </>
  );
};
