import { lazy, useSyncExternalStore } from "react";
import type { RefObject, SyntheticEvent } from "react";
import Image from "next/image";
import { decode } from "he";
import type { PlayerProps, PlayerState } from "@/lib/types";
import img from "@/public/P1080841.jpg";
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
  update_progress: (event: SyntheticEvent<HTMLVideoElement>) => void;
  load_media: (event: SyntheticEvent<HTMLVideoElement>) => void;
};

// Keep artwork and browser-only playback separate from the modal and controls.
export const PlayerMedia = ({
  mediaItem,
  state,
  audioRef,
  play_media,
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
      <div className="mx-auto flex w-96">
        <Image
          src={
            imageSrc
              ? `https://www.paullowe.org/wp-content/uploads/${imageSrc}`
              : img
          }
          width={imageSrc ? 400 : undefined}
          height={imageSrc ? 400 : undefined}
          alt="Nature Beach"
          className="h-auto w-full object-cover"
        />
      </div>
      {state.duration !== 0 && (
        <span className="my-3 block text-center text-sm text-gray-200">
          {title ? decode(title) : ""}
        </span>
      )}
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
          onTimeUpdate={update_progress}
          onLoadedMetadata={load_media}
        />
      )}
    </>
  );
};
