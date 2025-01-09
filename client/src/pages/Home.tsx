import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "@/components/VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import type { Video } from "@db/schema";

type VideoResponse = Video[];

export default function Home() {
  const [sessionId] = useState(() => uuidv4());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMuted] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error
  } = useInfiniteQuery<VideoResponse>({
    queryKey: ["/api/videos", { category: selectedCategory }],
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (videoId: number) => {
      await fetch(`/api/videos/${videoId}/view`, { method: "POST" });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (!response.ok) throw new Error("Failed to like video");
      return response.json();
    },
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: ["/api/videos", {category: selectedCategory}] });

      setLikedVideos(prev => {
        const next = new Set(prev);
        if (next.has(videoId)) {
          next.delete(videoId);
        } else {
          next.add(videoId);
        }
        return next;
      });

      const videos = data?.pages.flat() || [];
      const videoToUpdate = videos.find(v => v.id === videoId);
      if (videoToUpdate) {
        const isLiked = likedVideos.has(videoId);
        const updatedVideo = {
          ...videoToUpdate,
          likes: videoToUpdate.likes + (isLiked ? -1 : 1)
        };
        queryClient.setQueryData(["/api/videos", {category: selectedCategory}], (old: any) => {
          return {
            pages: old.pages.map((page: Video[]) =>
              page.map(video =>
                video.id === videoId ? updatedVideo : video
              )
            ),
            pageParams: old.pageParams,
          };
        });
      }
    },
    onError: (error, videoId) => {
      setLikedVideos(prev => {
        const next = new Set(prev);
        if (next.has(videoId)) {
          next.delete(videoId);
        } else {
          next.add(videoId);
        }
        return next;
      });

      toast({
        title: "Error",
        description: "Failed to like video",
        variant: "destructive"
      });
    }
  });

  const videos = data?.pages.flat() || [];
  const currentVideo = videos[currentIndex];

  useEffect(() => {
    if (currentVideo) {
      viewMutation.mutate(currentVideo.id);
    }
  }, [currentVideo?.id]);

  const handleNext = () => {
    if (currentIndex === videos.length - 2 && hasNextPage) {
      fetchNextPage();
    }
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleLike = async () => {
    if (!currentVideo) return;
    try {
      await likeMutation.mutateAsync(currentVideo.id);
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  const toggleAutoplay = () => {
    setAutoplay(prev => !prev);
  };

  const toggleMuted = () => {
    setMuted(prev => !prev);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    setCurrentIndex(0);
    // Reset and refetch with the new category
    queryClient.resetQueries({
      queryKey: ["/api/videos", { category: newCategory }]
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error loading videos</h2>
          <p className="opacity-80">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No videos available</h2>
          <p className="opacity-80">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {selectedCategory && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
          >
            {selectedCategory} ✕
          </button>
        </div>
      )}
      <AnimatePresence>
        {currentVideo && (
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <VideoPlayer
              video={currentVideo}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onLike={handleLike}
              isLiked={likedVideos.has(currentVideo.id)}
              autoplay={autoplay}
              onAutoplayToggle={toggleAutoplay}
              muted={muted}
              onMutedToggle={toggleMuted}
              onCategoryClick={handleCategoryClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}