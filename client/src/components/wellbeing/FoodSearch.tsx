import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FoodProduct {
  barcode: string;
  name: string;
  brand?: string;
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugars?: number;
  saturatedFat?: number;
  sodium?: number;
  cholesterol?: number;
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
  nutriScore?: string;
}

interface FoodSearchProps {
  onSelectFood: (food: FoodProduct) => void;
}

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchFoods = trpc.wellbeing.searchFoods.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: false }
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const data = await searchFoods.refetch();
    setResults(data.data || []);
    setIsSearching(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for food (e.g., 'apple', 'chicken breast')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((food) => (
            <Card key={food.barcode} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{food.name}</h4>
                  {food.brand && (
                    <p className="text-sm text-muted-foreground">{food.brand}</p>
                  )}
                  {food.servingSize && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Serving: {food.servingSize}
                    </p>
                  )}

                  {/* Nutritional Info */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {food.calories && (
                      <Badge variant="secondary">{Math.round(food.calories)} cal</Badge>
                    )}
                    {food.protein && (
                      <Badge variant="outline">{food.protein.toFixed(1)}g protein</Badge>
                    )}
                    {food.carbs && (
                      <Badge variant="outline">{food.carbs.toFixed(1)}g carbs</Badge>
                    )}
                    {food.fat && (
                      <Badge variant="outline">{food.fat.toFixed(1)}g fat</Badge>
                    )}
                    {food.nutriScore && (
                      <Badge
                        variant={
                          food.nutriScore === "a" || food.nutriScore === "b"
                            ? "default"
                            : "destructive"
                        }
                      >
                        Nutri-Score: {food.nutriScore.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {/* Detailed Nutrients */}
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {food.fiber && <div>Fiber: {food.fiber.toFixed(1)}g</div>}
                    {food.sugars && <div>Sugars: {food.sugars.toFixed(1)}g</div>}
                    {food.sodium && <div>Sodium: {food.sodium.toFixed(0)}mg</div>}
                    {food.cholesterol && (
                      <div>Cholesterol: {food.cholesterol.toFixed(0)}mg</div>
                    )}
                  </div>
                </div>

                <Button size="sm" onClick={() => onSelectFood(food)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && searchQuery && !isSearching && (
        <p className="text-center text-muted-foreground py-8">
          No results found. Try a different search term.
        </p>
      )}
    </div>
  );
}
