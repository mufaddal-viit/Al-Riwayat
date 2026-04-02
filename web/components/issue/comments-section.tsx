import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { previewComments, type CommentItem } from "@/lib/content/comments";
import { cn } from "@/lib/utils";

type CommentsSectionProps = {
  comments?: readonly CommentItem[];
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CommentsSection({
  comments = previewComments,
  className,
}: CommentsSectionProps) {
  return (
    <section
      aria-labelledby="comments-heading"
      className={cn("mx-auto max-w-[72ch]", className)}
    >
      <Card className="overflow-hidden border-border/70 bg-card/88">
        <CardHeader className="space-y-4">
          {/* <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">Reader Comments</Badge>
            <Badge className="bg-secondary/70 text-secondary-foreground">
              {comments.length} Notes
            </Badge>
          </div> */}
          <div className="space-y-3">
            <CardTitle id="comments-heading" className="text-3xl sm:text-4xl">
              Reader Notes
            </CardTitle>
            <CardDescription className="max-w-2xl text-base">
              Hear what our readers have to say and join the conversation.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[1.75rem] border border-border/70 bg-background/76 p-4 shadow-lifted backdrop-blur sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/45 font-heading text-sm uppercase text-foreground">
                    {getInitials(comment.author)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-medium text-foreground">
                        {comment.author}
                      </p>
                      {comment.role ? (
                        <span className="text-sm text-muted-foreground">
                          {comment.role}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* <Badge variant="outline" className="bg-card/70">
                  {comment.chipLabel}
                </Badge> */}
              </div>

              <p className="mt-4 text-[0.98rem] leading-7 text-foreground/90">
                {comment.body}
              </p>
            </article>
          ))}
        </CardContent>

        <CardFooter className="border-t border-border/70 bg-gradient-to-b from-background/10 to-background/40 p-4 sm:p-6">
          <div className="w-full rounded-[1.5rem] border border-border/70 bg-background/80 p-4  backdrop-blur sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit bg-card/65">
                  Join The Conversation
                </Badge>
                <div className="space-y-1">
                  {/* <Label htmlFor="comment-input">Add your comment below</Label> */}
                  <p className="text-sm leading-6 text-muted-foreground">
                    Keep the note thoughtful, clear, and connected to the story.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Input
                    disabled={true}
                    id="comment-input"
                    placeholder="Type your comment..."
                    className="border-border/70 bg-card/70"
                  />
                </div>
                <Button type="button" className="w-full sm:w-auto">
                  Submit Comment
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}
