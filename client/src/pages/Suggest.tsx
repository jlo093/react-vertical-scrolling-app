import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoSuggestionForm from "@/components/VideoSuggestionForm";

export default function Suggest() {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Suggest a Video</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoSuggestionForm />
        </CardContent>
      </Card>
    </div>
  );
}
