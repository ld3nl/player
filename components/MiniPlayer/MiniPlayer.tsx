"use client";

import { useState, useEffect, useReducer, useCallback } from "react";
import ReactPlayer from "react-player";

import { Heart, Play, Stop } from "@phosphor-icons/react";
import Button from "../Button/Button";

import { INITIAL_STATE } from "@/lib/constants"; // Initial state for the player

import { PlayerState, PlayerAction } from "@/lib/types"; // Types for player state and actions

type MiniPlayerProps = {
  title?: string;
  imageSrc?: string;
  slug: string;
  children?: React.ReactNode;
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
  title,
  imageSrc,
  slug,
  children,
}: MiniPlayerProps) {
  const [state, dispatch] = useReducer(playerReducer, {
    ...INITIAL_STATE,
    // id: id || 0,
    // playedSeconds: playedSeconds || 0,
    // duration: duration || 0,
    // isFavorite: isFavorite || false,
  });

  const [audio, setAudio] = useState(null);

  // Fetch audio data when the component mounts
  useEffect(() => {
    if (!slug) {
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

        console.log(fetchedAudio);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    };

    fetchAndSetAudio();
  }, [slug]);

  // Handle playback stop
  const handleStop = () => {
    dispatch({ type: "SET_PLAYING", payload: false });
  };

  // Handle playback toggle between play/pause
  const handlePlay = () => {
    dispatch({ type: "SET_PLAYING", payload: true });
  };

  const handlePlayPause = () => {
    dispatch({ type: "SET_PLAYING", payload: !state.playing });
  };

  const toggleFavorite = useCallback(() => {
    dispatch({ type: "TOGGLE_FAVORITE" });
  }, [state]);

  return (
    <div
      className={`fixed inset-x-5 bottom-0 flex ${state.isAnimatingOut ? "translate-y-0" : "translate-y-full"} items-end justify-between gap-4 rounded-t-xl bg-blue-400 p-4 text-xs text-white transition-transform`}
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
          //   onProgress={handleProgress}
          //   onDuration={handleDuration}
        />
      )}

      {imageSrc && (
        <img src={imageSrc} alt={title} className="size-16 rounded-lg" />
      )}
      {title && <span className="text-gray-200">{title}</span>}
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
