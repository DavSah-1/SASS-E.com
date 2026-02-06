import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ArticleQuiz from "@/components/ArticleQuiz";
import { RetirementCalculator } from "@/components/learn-finance/RetirementCalculator";
import { DebtPayoffSimulator } from "@/components/learn-finance/DebtPayoffSimulator";

export default function ArticleReader() {
  const [, params] = useRoute("/learn-finance/article/:slug");
  const slug = params?.slug || "";

  const [readingProgress, setReadingProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch article data
  const { data: article, isLoading } = trpc.learnFinance.getArticle.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Fetch all articles to show related ones
  const { data: allArticles } = trpc.learnFinance.getArticles.useQuery();
  
  // Filter related articles (same difficulty, exclude current)
  const relatedArticles = allArticles?.filter(
    (a) => a.difficulty === article?.difficulty && a.id !== article?.id
  ).slice(0, 4);

  // Track reading progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent =
        (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mark article as complete
  const updateProgressMutation =
    trpc.learnFinance.updateProgress.useMutation();

  const handleMarkComplete = async () => {
    if (!article) return;
    try {
      await updateProgressMutation.mutateAsync({
        articleId: article.id,
        progress: 100,
        completed: true,
      });
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The article you're looking for doesn't exist.
          </p>
          <Link href="/learn-finance">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learn Finance
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Related articles already filtered above

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={readingProgress} className="h-1 rounded-none" />
      </div>

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/learn-finance">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learn Finance
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{article.difficulty}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              {/* Article Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
                <p className="text-xl text-muted-foreground">
                  {article.summary}
                </p>
              </div>

              {/* Article Content */}
              <ReactMarkdown>{article.content}</ReactMarkdown>

              {/* Interactive Calculator (if applicable) */}
              {article.slug === "retirement-savings-calculator" && (
                <div className="my-8 not-prose">
                  <RetirementCalculator />
                </div>
              )}
              {article.slug === "debt-payoff-simulator" && (
                <div className="my-8 not-prose">
                  <DebtPayoffSimulator />
                </div>
              )}

              {/* Article Quiz */}
              <ArticleQuiz articleId={article.id} />

              {/* Mark as Complete */}
              <div className="mt-12 p-6 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Finished reading?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Mark this article as complete to track your progress.
                    </p>
                  </div>
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isCompleted || updateProgressMutation.isPending}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      "Mark as Complete"
                    )}
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center pt-8 border-t">
                <Button variant="outline" disabled>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Article
                </Button>
                <Button variant="outline" disabled>
                  Next Article
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Related Articles */}
              {relatedArticles && relatedArticles.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Related Articles
                  </h3>
                  <div className="space-y-3">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        href={`/learn-finance/article/${related.slug}`}
                      >
                        <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{related.readTime} min</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Progress Card */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Reading Progress
                      </span>
                      <span className="font-medium">
                        {Math.round(readingProgress)}%
                      </span>
                    </div>
                    <Progress value={readingProgress} />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Keep reading to complete this article and earn your
                      progress badge!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
