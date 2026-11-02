import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowClockwiseIcon,
  SpinnerIcon,
  WaveformIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cnfast";
import { useState } from "react";
import Button from "@/components/Button/Button";
import type { PlayerProps } from "@/lib/types";
import { usePlayerPlayback } from "./hooks";
import { PlayerControls } from "./PlayerControls";
import { PlayerMedia } from "./PlayerMedia";

const MainPlayer = ({ mediaItem, closeModal, stateCallback }: PlayerProps) => {
  const playback = usePlayerPlayback(mediaItem, stateCallback);
  const { state } = playback;
  const [isOpen, setIsOpen] = useState(true);
  const [has_error, set_has_error] = useState(false);
  const report_error = () => {
    set_has_error(true);
    playback.pause_media();
  };
  const retry_media = () => {
    set_has_error(false);
    playback.audioRef.current?.load();
    playback.play_media();
  };

  return (
    <Transition appear show={isOpen} afterLeave={closeModal}>
      <Dialog
        onClose={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300 data-closed:opacity-0 motion-reduce:transition-none",
        )}
      >
        <DialogBackdrop
          className={cn("fixed inset-0 bg-slate-950/75 backdrop-blur-md")}
        />
        <div
          className={cn(
            "fixed inset-0 flex items-center justify-center p-3 sm:p-6",
          )}
        >
          <DialogPanel
            className={cn(
              "relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]",
            )}
          >
            <div
              className={cn(
                "sticky top-0 z-10 flex items-center justify-between bg-white px-5 pb-2 pt-3 sm:px-8",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-2 text-sm font-medium text-slate-500",
                )}
              >
                <WaveformIcon
                  size={20}
                  aria-hidden="true"
                  className={cn("text-purple-700")}
                />{" "}
                Now listening
              </span>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                ariaLabel="Close audio player"
                autoFocus
              >
                <XIcon aria-hidden="true" focusable="false" size={22} />
              </Button>
            </div>
            <PlayerMedia
              mediaItem={mediaItem}
              report_error={report_error}
              {...playback}
            />
            {has_error ? (
              <div role="alert" className={cn("px-6 pb-8 pt-6 text-center")}>
                <p className={cn("font-semibold text-slate-900")}>
                  This talk couldn’t load
                </p>
                <p
                  className={cn("mt-2 text-sm leading-relaxed text-slate-600")}
                >
                  Check your connection and try again.
                </p>
                <Button
                  size="label"
                  variant="secondary"
                  ariaLabel="Try loading audio again"
                  onClick={retry_media}
                  className={cn("mt-5")}
                >
                  <ArrowClockwiseIcon size={19} aria-hidden="true" />
                  Try again
                </Button>
                {mediaItem.link && (
                  <a
                    href={mediaItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("ui-control mt-3")}
                    data-size="label"
                  >
                    Open original talk
                  </a>
                )}
              </div>
            ) : state.duration > 0 ? (
              <PlayerControls link={mediaItem.link} {...playback} />
            ) : (
              <div
                className={cn(
                  "flex items-center justify-center gap-3 px-5 py-8 text-sm text-slate-600",
                )}
                role="status"
              >
                <SpinnerIcon
                  aria-hidden="true"
                  focusable="false"
                  size={24}
                  className={cn(
                    "animate-spin text-purple-700 motion-reduce:animate-none",
                  )}
                />
                <span>Loading audio…</span>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MainPlayer;
