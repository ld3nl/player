import debounce from "lodash/debounce";
import type { SyntheticEvent } from "react";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { INITIAL_STATE } from "@/lib/constants";
import type { MediaState, PlayerProps } from "@/lib/types";
import { reduce_player } from "./utils";

// Own playback state and translate media events into persisted progress.
export const usePlayerPlayback = (
  mediaItem: PlayerProps["mediaItem"],
  stateCallback: PlayerProps["stateCallback"],
) => {
  const [state, dispatch] = useReducer(reduce_player, {
    ...INITIAL_STATE,
    id: mediaItem.id || 0,
    playedSeconds: mediaItem.playedSeconds || 0,
    duration: mediaItem.duration || 0,
    isFavorite: mediaItem.isFavorite || false,
    played:
      mediaItem.duration > 0
        ? Math.min(1, Math.max(0, mediaItem.playedSeconds / mediaItem.duration))
        : 0,
  });
  const audioRef = useRef<HTMLVideoElement>(null);
  const isSeekingRef = useRef(false);

  const update_media = useMemo(
    () => debounce((nextState: MediaState) => stateCallback?.(nextState), 300),
    [stateCallback],
  );

  // Flush the last progress/favorite update before replacing its callback.
  useEffect(() => () => update_media.flush(), [update_media]);

  const seek_media = useCallback(
    (fraction: number) => {
      const played = Math.min(Math.max(fraction, 0), 1);
      dispatch({ type: "SEEK", payload: played });
      if (audioRef.current) {
        audioRef.current.currentTime = played * state.duration;
      }
    },
    [state.duration],
  );

  // Preview every movement immediately; commit the media seek on release.
  const change_seek = (fraction: number) => {
    isSeekingRef.current = true;
    dispatch({ type: "SEEK", payload: Math.min(Math.max(fraction, 0), 1) });
  };

  const finish_seek = (fraction: number) => {
    isSeekingRef.current = false;
    seek_media(fraction);
  };

  const skip_media = (action: "backward" | "forward", seconds: number) => {
    if (!state.duration) return;
    const offset = seconds / state.duration;
    seek_media(state.played + (action === "backward" ? -offset : offset));
  };

  const play_media = () => dispatch({ type: "SET_PLAYING", payload: true });
  const pause_media = () => dispatch({ type: "SET_PLAYING", payload: false });
  const change_rate = (rate: number) =>
    dispatch({ type: "SET_PLAYBACK_RATE", payload: rate });
  const toggle_playback = () =>
    dispatch({ type: "SET_PLAYING", payload: !state.playing });

  const toggle_favorite = () => {
    dispatch({ type: "TOGGLE_FAVORITE" });
    update_media({ ...state, isFavorite: !state.isFavorite });
  };

  // ReactPlayer v3 exposes an HTML media element and native media events.
  const update_progress = (event: SyntheticEvent<HTMLVideoElement>) => {
    // Playback events must not move the preview while the user is scrubbing.
    if (isSeekingRef.current) return;
    const { currentTime, duration } = event.currentTarget;
    const played = duration > 0 ? currentTime / duration : 0;
    dispatch({ type: "SEEK", payload: played });
    dispatch({ type: "SET_PLAYED_SECONDS", payload: currentTime });
    if (!state.seeking) {
      startTransition(() => {
        update_media({ ...state, playedSeconds: currentTime });
      });
    }
  };

  const load_media = (event: SyntheticEvent<HTMLVideoElement>) => {
    const media = event.currentTarget;
    dispatch({ type: "SET_DURATION", payload: media.duration });
    media.currentTime = state.playedSeconds;
  };

  return {
    state,
    dispatch,
    audioRef,
    change_seek,
    finish_seek,
    skip_media,
    play_media,
    pause_media,
    change_rate,
    toggle_playback,
    toggle_favorite,
    update_progress,
    load_media,
  };
};
