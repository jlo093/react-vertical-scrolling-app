import { Heart, PlayCircle, PauseCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Video } from "@db/schema";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  video: Video;
  onLike: () => void;
  isLiked: boolean;
  autoplay: boolean;
  onAutoplayToggle: () => void;
  muted: boolean;
  onMutedToggle: () => void;
  onCategoryClick?: (category: string) => void;
}

export default function VideoControls({
  video,
  onLike,
  isLiked,
  autoplay,
  onAutoplayToggle,
  muted,
  onMutedToggle,
  onCategoryClick,
}: VideoControlsProps) {
  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 pb-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-lg font-semibold">{video.title}</h2>
            {video.category && (
              <button
                onClick={() => onCategoryClick?.(video.category!)}
                className="text-sm px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 transition mb-2"
              >
                {video.category}
              </button>
            )}
            <p className="text-sm opacity-80">{video.description}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center">
              <button
                onClick={onMutedToggle}
                className="p-2 rounded-full hover:bg-white/20 transition"
                aria-label={muted ? "Unmute video" : "Mute video"}
              >
                {muted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
              <span className="text-xs mt-1">Audio</span>
            </div>
            <div className="flex flex-col items-center">
              <button
                onClick={onAutoplayToggle}
                className="p-2 rounded-full hover:bg-white/20 transition"
                aria-label={autoplay ? "Disable autoplay" : "Enable autoplay"}
              >
                {autoplay ? (
                  <PauseCircle className="w-6 h-6" />
                ) : (
                  <PlayCircle className="w-6 h-6" />
                )}
              </button>
              <span className="text-xs mt-1">Autoplay</span>
            </div>
            <button
              onClick={onLike}
              className={cn(
                "p-2 rounded-full hover:bg-white/20 transition",
                isLiked && "text-red-500",
              )}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </button>
            <span className="text-sm">{video.likes}</span>
            <span className="text-sm opacity-80">{video.views} views</span>
          </div>
        </div>
      </div>
    </>
  );
}