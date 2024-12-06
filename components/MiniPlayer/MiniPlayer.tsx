"use client";
import { useRouter, useSearchParams } from "next/navigation";

import { useState, useEffect, useReducer, useCallback } from "react";
import ReactPlayer from "react-player";

import { Play, Stop } from "@phosphor-icons/react";
import Button from "../Button/Button";

import { INITIAL_STATE } from "@/lib/constants"; // Initial state for the player

import { PlayerState, PlayerAction } from "@/lib/types"; // Types for player state and actions

interface HandleMetaAudioTitleParams {
  key: string;
  value: string | null;
}

type MiniPlayerProps = {
  className?: string;
  title?: string;
  imageSrc?: string;
  slug: string;
  id: number;
  children?: React.ReactNode;
  playedSeconds?: number;
  // eslint-disable-next-line no-unused-vars
  getProgress?: (playedSeconds: number) => void;
  // eslint-disable-next-line no-unused-vars
  getDuration?: (duration: number) => void;
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_PLAYING":
      return { ...state, playing: action.payload };
    case "SET_PLAYED_SECONDS":
      return { ...state, playedSeconds: action.payload };
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "TOGGLE_FAVORITE":
      return { ...state, isFavorite: !state.isFavorite };
    case "SEEK":
      return { ...state, played: action.payload };
    case "SET_DURATION":
      return { ...state, duration: action.payload };
    case "TOGGLE_MODAL":
      return { ...state, isOpen: action.payload };
    case "CLOSE_MODAL":
      return { ...state, isOpen: false, isAnimatingOut: true };
    case "ANIMATE_OUT":
      return { ...state, isAnimatingOut: action.payload };
    default:
      return state;
  }
}

const fetchAudio = async (slug: string) => {
  const res = await fetch(`/api/audio?slug=${slug}`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return data;
};

export default function MiniPlayer({
  className,
  title,
  imageSrc,
  slug,
  id,
  children,
  getProgress,
  getDuration,
}: MiniPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setMetaAudioTitle = ({ key, value }: HandleMetaAudioTitleParams) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const pathname = window.location.pathname;
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false }); // This prevents scrolling to the top on navigation
  };

  // const audioTitle = searchParams.get("audioTitle");
  // console.log(audioTitle);

  const [state, dispatch] = useReducer(playerReducer, {
    ...INITIAL_STATE,
  });

  const [audio, setAudio] = useState(null);

  // Fetch audio data when the component mounts
  useEffect(() => {
    if (!slug || !id) {
      return;
    }

    const fetchAndSetAudio = async () => {
      try {
        dispatch({ type: "SET_PLAYING", payload: false });
        dispatch({ type: "ANIMATE_OUT", payload: false });

        const fetchedAudio = await fetchAudio(slug);

        setAudio(fetchedAudio.audioUrl);

        setTimeout(() => {
          dispatch({ type: "ANIMATE_OUT", payload: true });
          dispatch({ type: "SET_PLAYING", payload: true });
        }, 300);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    };

    fetchAndSetAudio();
  }, [slug, id]);

  // Handle playback stop
  const handleStop = () => {
    dispatch({ type: "SET_PLAYING", payload: false });
  };

  // Handle playback toggle between play/pause
  const handlePlay = () => {
    dispatch({ type: "SET_PLAYING", payload: true });

    setMetaAudioTitle({ key: "audioTitle", value: title ?? null });
  };

  const handlePlayPause = () => {
    dispatch({ type: "SET_PLAYING", payload: !state.playing });
  };

  const toggleFavorite = useCallback(() => {
    dispatch({ type: "TOGGLE_FAVORITE" });
  }, [state]);

  // const isCurrentlyFavorite = mediaStates.some(
  //   (val) =>
  //     (val.id === state.id || val.slug === state.slug) && val.isFavorite,
  // );
  // updateMediaState({
  //   id: state.id,
  //   slug: state.slug,
  //   isFavorite: !isCurrentlyFavorite,
  // });

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    // console.log("playedSeconds", playedSeconds);
    // console.log("progress", progress);
    // dispatch({ type: "SET_PLAYED_SECONDS", payload: progress.played });
    if (typeof getProgress === "function") {
      getProgress(playedSeconds);
    }

    if (playedSeconds === state.duration) {
      handleStop();
    }
  };

  const handleDuration = (duration: number) => {
    // console.log("duration", duration, state.duration);
    // console.log("mediaStates", id);
    // if (!id) {
    //   return;
    // }

    // const isCurrentlyDurationSet = mediaStates.some(
    //   (val) => val.id === id && val.duration !== 0,
    // );

    // console.log("isCurrentlyDurationSet", isCurrentlyDurationSet);
    // if (!isCurrentlyDurationSet) {
    //   updateMediaState({
    //     id: id,
    //     duration,
    //   });
    // }

    dispatch({ type: "SET_DURATION", payload: duration });

    if (typeof getDuration === "function") {
      getDuration(duration);
    }
  };

  return (
    <div
      className={[
        `fixed inset-x-5 bottom-0 flex items-end gap-4 rounded-t-xl bg-blue-400 p-4 text-xs text-white`,
        className,
      ].join(" ")}
    >
      {audio && (
        <ReactPlayer
          url={audio}
          style={{ display: "none" }}
          pip={state.pip}
          playing={state.playing}
          controls={state.controls}
          light={state.light}
          loop={state.loop}
          playbackRate={state.playbackRate}
          volume={state.volume}
          muted={state.muted}
          onPlay={handlePlay}
          onProgress={handleProgress}
          onDuration={handleDuration}
        />
      )}

      {imageSrc && (
        <img src={imageSrc} alt={title} className="size-16 rounded-lg" />
      )}
      {title && <span className={["text-gray-200"].join(" ")}>{title}</span>}
      {children}
      <Button
        ariaLabel="Play"
        className="flex aspect-square size-9 items-center justify-center rounded-full bg-white"
        onClick={() => handlePlayPause()}
      >
        {state.playing ? (
          <Stop size={18} color="hotpink" weight="fill" />
        ) : (
          <Play size={18} color="hotpink" weight="fill" />
        )}
      </Button>
    </div>
  );
}
