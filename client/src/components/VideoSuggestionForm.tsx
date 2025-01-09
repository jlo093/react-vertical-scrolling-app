import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const videoSuggestionSchema = z.object({
  url: z.string().url("Please enter a valid video URL"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type VideoSuggestionForm = z.infer<typeof videoSuggestionSchema>;

export default function VideoSuggestionForm() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const form = useForm<VideoSuggestionForm>({
    resolver: zodResolver(videoSuggestionSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: VideoSuggestionForm) => {
      const response = await fetch("/api/video-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your video suggestion has been submitted for review",
      });
      form.reset();
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit video suggestion",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: VideoSuggestionForm) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/video.mp4" {...field} />
              </FormControl>
              <FormDescription>
                Enter the URL of the video you want to suggest
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for the video" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for the video"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Submitting..." : "Submit Suggestion"}
        </Button>
      </form>
    </Form>
  );
}