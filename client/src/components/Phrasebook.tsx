import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  BookMarked, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Volume2,
  Copy,
  Check,
  Folder,
  FolderPlus
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PhrasebookProps {
  onSpeak: (text: string, language: string) => void;
  isSpeaking: boolean;
}

const DEFAULT_CATEGORIES = [
  { name: "Greetings", icon: "👋" },
  { name: "Dining", icon: "🍽️" },
  { name: "Travel", icon: "✈️" },
  { name: "Emergency", icon: "🚨" },
  { name: "Shopping", icon: "🛍️" },
];

export function Phrasebook({ onSpeak, isSpeaking }: PhrasebookProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Queries
  const { data: categories = [] } = trpc.translation.getCategories.useQuery();
  const { data: translations = [] } = trpc.translation.getSavedTranslations.useQuery({
    categoryId: selectedCategory,
  });

  // Mutations
  const createCategoryMutation = trpc.translation.createCategory.useMutation({
    onSuccess: () => {
      utils.translation.getCategories.invalidate();
      toast.success("Category created!");
      setNewCategoryName("");
      setNewCategoryIcon("");
      setIsCreateCategoryOpen(false);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const deleteCategoryMutation = trpc.translation.deleteCategory.useMutation({
    onSuccess: () => {
      utils.translation.getCategories.invalidate();
      utils.translation.getSavedTranslations.invalidate();
      toast.success("Category deleted");
      if (selectedCategory) setSelectedCategory(undefined);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const deleteTranslationMutation = trpc.translation.deleteSavedTranslation.useMutation({
    onSuccess: () => {
      utils.translation.getSavedTranslations.invalidate();
      toast.success("Translation deleted");
    },
    onError: () => toast.error("Failed to delete translation"),
  });

  const toggleFavoriteMutation = trpc.translation.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.translation.getSavedTranslations.invalidate();
    },
    onError: () => toast.error("Failed to update favorite"),
  });

  const updateCategoryMutation = trpc.translation.updateCategory.useMutation({
    onSuccess: () => {
      utils.translation.getSavedTranslations.invalidate();
      toast.success("Category updated");
    },
    onError: () => toast.error("Failed to update category"),
  });

  // Initialize default categories if none exist
  const initializeDefaultCategories = async () => {
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await createCategoryMutation.mutateAsync(cat);
      }
    }
  };

  // Filter translations by search query
  const filteredTranslations = translations.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.originalText.toLowerCase().includes(query) ||
      t.translatedText.toLowerCase().includes(query)
    );
  });

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-purple-400" />
            My Phrasebook
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {translations.length} saved translation{translations.length !== 1 ? "s" : ""}
          </p>
        </div>
        
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Button
              onClick={initializeDefaultCategories}
              variant="outline"
              size="sm"
              className="border-purple-500/20"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Add Default Categories
            </Button>
          )}
          
          <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Create Category</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new category to organize your translations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name" className="text-slate-300">
                    Category Name
                  </Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Business, Medical, Slang"
                    className="bg-slate-900/50 border-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-icon" className="text-slate-300">
                    Icon (optional emoji)
                  </Label>
                  <Input
                    id="category-icon"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="e.g., 💼 🏥 💬"
                    maxLength={2}
                    className="bg-slate-900/50 border-purple-500/20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      createCategoryMutation.mutate({
                        name: newCategoryName.trim(),
                        icon: newCategoryIcon.trim() || undefined,
                      });
                    }
                  }}
                  disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search translations..."
            className="pl-10 bg-slate-900/50 border-purple-500/20"
          />
        </div>
        
        <Select
          value={selectedCategory?.toString() || "all"}
          onValueChange={(v) => setSelectedCategory(v === "all" ? undefined : Number(v))}
        >
          <SelectTrigger className="bg-slate-900/50 border-purple-500/20">
            <Folder className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Management */}
      {categories.length > 0 && (
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg border border-purple-500/20"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-slate-300">{cat.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"? Translations will be uncategorized.`)) {
                        deleteCategoryMutation.mutate({ categoryId: cat.id });
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translations List */}
      {filteredTranslations.length === 0 ? (
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <BookMarked className="h-12 w-12 text-slate-600 mx-auto" />
              <p className="text-slate-400">
                {searchQuery
                  ? "No translations found matching your search"
                  : "No saved translations yet"}
              </p>
              <p className="text-slate-500 text-sm">
                {!searchQuery && "Save translations from the Translate tab to build your phrasebook"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTranslations.map((translation) => {
            const category = categories.find((c) => c.id === translation.categoryId);
            
            return (
              <Card key={translation.id} className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {translation.sourceLanguage} → {translation.targetLanguage}
                        </span>
                        {category && (
                          <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                            {category.icon} {category.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleFavoriteMutation.mutate({ translationId: translation.id })}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              translation.isFavorite === 1
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-400"
                            }`}
                          />
                        </Button>
                        
                        <Select
                          value={translation.categoryId?.toString() || "none"}
                          onValueChange={(v) => {
                            updateCategoryMutation.mutate({
                              translationId: translation.id,
                              categoryId: v === "none" ? null : Number(v),
                            });
                          }}
                        >
                          <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent">
                            <Folder className="h-4 w-4 text-slate-400" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.icon} {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            if (confirm("Delete this translation?")) {
                              deleteTranslationMutation.mutate({ translationId: translation.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Original Text */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Original:</p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => onSpeak(translation.originalText, translation.sourceLanguage)}
                            disabled={isSpeaking}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(translation.originalText, translation.id * 2)}
                          >
                            {copiedId === translation.id * 2 ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-slate-200">{translation.originalText}</p>
                    </div>
                    
                    {/* Translated Text */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Translation:</p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => onSpeak(translation.translatedText, translation.targetLanguage)}
                            disabled={isSpeaking}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(translation.translatedText, translation.id * 2 + 1)}
                          >
                            {copiedId === translation.id * 2 + 1 ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-green-300 font-medium">{translation.translatedText}</p>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-700">
                      <span>Used {translation.usageCount} time{translation.usageCount !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>Last used {new Date(translation.lastUsedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
