import { useRef, useCallback, useEffect, WheelEvent } from "react";
import ReactPlayer from "react-player";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import VideoControls from "@/components/VideoControls";
import type { Video } from "@db/schema";

interface VideoPlayerProps {
  video: Video;
  onNext: () => void;
  onPrevious: () => void;
  onLike: () => void;
  isLiked: boolean;
  autoplay: boolean;
  onAutoplayToggle: () => void;
  muted: boolean;
  onMutedToggle: () => void;
  onCategoryClick?: (category: string) => void;
}

export default function VideoPlayer({ 
  video, 
  onNext, 
  onPrevious, 
  onLike, 
  isLiked,
  autoplay,
  onAutoplayToggle,
  muted,
  onMutedToggle,
  onCategoryClick
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const y = useMotionValue(0);
  const scale = useTransform(y, [-100, 0, 100], [0.9, 1, 0.9]);
  const opacity = useTransform(y, [-100, 0, 100], [0.3, 1, 0.3]);
  const autoplayTimerRef = useRef<NodeJS.Timeout>();

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.y < -swipeThreshold) {
      onNext();
    } else if (info.offset.y > swipeThreshold) {
      onPrevious();
    }
  };

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    const scrollThreshold = 50;
    if (e.deltaY < -scrollThreshold) {
      onPrevious();
    } else if (e.deltaY > scrollThreshold) {
      onNext();
    }
  }, [onNext, onPrevious]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (autoplay) {
      autoplayTimerRef.current = setInterval(() => {
        onNext();
      }, 8000);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, onNext]);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <div className="absolute top-4 left-4 z-50 opacity-80 hover:opacity-100 transition-opacity">
        <h1 className="text-white font-bold text-2xl tracking-tight">
          gooned.me
        </h1>
      </div>

      <motion.div
        className="absolute inset-0 touch-none select-none overscroll-none"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          y,
          scale,
          opacity,
          touchAction: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none'
        }}
        whileTap={{ cursor: "grabbing" }}
      >
        <ReactPlayer
          ref={playerRef}
          url={video.url}
          width="100%"
          height="100%"
          playing
          loop
          playsinline
          muted={muted}
          controls={false}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          config={{
            file: {
              attributes: {
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }
              }
            }
          }}
        />
      </motion.div>

      <VideoControls
        video={video}
        onLike={onLike}
        isLiked={isLiked}
        autoplay={autoplay}
        onAutoplayToggle={onAutoplayToggle}
        muted={muted}
        onMutedToggle={onMutedToggle}
        onCategoryClick={onCategoryClick}
      />
    </div>
  );
}