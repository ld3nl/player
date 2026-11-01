import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { Dispatch, SyntheticEvent } from "react";
import debounce from "lodash/debounce";
import useLockScroll from "@/lib/hooks";
import { INITIAL_STATE } from "@/lib/constants";
import type { MediaState, PlayerAction, PlayerProps } from "@/lib/types";
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
  });
  const audioRef = useRef<HTMLVideoElement>(null);

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

  const change_seek = useMemo(() => debounce(seek_media, 300), [seek_media]);
  useEffect(() => () => change_seek.cancel(), [change_seek]);

  const finish_seek = (fraction: number) => {
    change_seek.cancel(); // A pending drag update must not override the release.
    seek_media(fraction);
  };

  const skip_media = (action: "backward" | "forward", seconds: number) => {
    if (!state.duration) return;
    const offset = seconds / state.duration;
    seek_media(state.played + (action === "backward" ? -offset : offset));
  };

  const play_media = () => dispatch({ type: "SET_PLAYING", payload: true });
  const toggle_playback = () =>
    dispatch({ type: "SET_PLAYING", payload: !state.playing });

  const toggle_favorite = () => {
    dispatch({ type: "TOGGLE_FAVORITE" });
    update_media({ ...state, isFavorite: !state.isFavorite });
  };

  // ReactPlayer v3 exposes an HTML media element and native media events.
  const update_progress = (event: SyntheticEvent<HTMLVideoElement>) => {
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
    toggle_playback,
    toggle_favorite,
    update_progress,
    load_media,
  };
};

// Own the modal lifecycle, including animation timers, focus, and Escape.
export const usePlayerModal = (
  mediaItem: PlayerProps["mediaItem"],
  isOpen: boolean,
  isAnimatingOut: boolean,
  dispatch: Dispatch<PlayerAction>,
  closeModal: PlayerProps["closeModal"],
) => {
  const { title, src } = mediaItem;
  const playerRef = useRef<HTMLDivElement>(null);
  const [isDelayingOpen, setIsDelayingOpen] = useState(false);
  useLockScroll(isOpen);

  useEffect(() => {
    if (!title || !src) return;
    dispatch({ type: "TOGGLE_MODAL", payload: true });
    setIsDelayingOpen(true);
    const openTimer = setTimeout(() => setIsDelayingOpen(false), 10);
    return () => clearTimeout(openTimer);
  }, [title, src, dispatch]);

  // Repeated close requests share one animation; unmount cancels the timer.
  const close_player = useCallback(() => {
    dispatch({ type: "ANIMATE_OUT", payload: true });
  }, [dispatch]);

  useEffect(() => {
    if (!isAnimatingOut) return;
    const closeTimer = setTimeout(() => {
      dispatch({ type: "TOGGLE_MODAL", payload: false });
      dispatch({ type: "ANIMATE_OUT", payload: false });
      closeModal();
    }, 500);
    return () => clearTimeout(closeTimer);
  }, [isAnimatingOut, closeModal, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const handle_keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close_player();
    };
    window.addEventListener("keydown", handle_keydown);
    playerRef.current?.focus();
    return () => window.removeEventListener("keydown", handle_keydown);
  }, [isOpen, close_player, dispatch]);

  return { playerRef, isDelayingOpen, close_player };
};
