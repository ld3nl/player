import type { PlayerAction, PlayerState } from "@/lib/types";

// Keep player transitions independent of rendering and browser effects.
export const reduce_player = (
  state: PlayerState,
  action: PlayerAction,
): PlayerState => {
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
};

// Hydration uses the server snapshot before switching to browser-only playback.
export const subscribe_hydration = () => () => {};
export const get_client_snapshot = () => false;
export const get_server_snapshot = () => true;
