/**
 * OpenFoodFacts API Integration
 * Free, open database with 2.9M+ food products
 */

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sugars_100g'?: number;
    'saturated-fat_100g'?: number;
    'sodium_100g'?: number;
    'cholesterol_100g'?: number;
    'vitamin-a_100g'?: number;
    'vitamin-c_100g'?: number;
    'calcium_100g'?: number;
    'iron_100g'?: number;
  };
  nutriscore_grade?: string;
  nova_group?: number;
}

interface FoodDatabaseProduct {
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
  novaGroup?: number;
}

const BASE_URL = 'https://world.openfoodfacts.net/api/v2';

/**
 * Look up a product by barcode
 */
export async function lookupProductByBarcode(barcode: string): Promise<FoodDatabaseProduct | null> {
  try {
    const response = await fetch(`${BASE_URL}/product/${barcode}?fields=code,product_name,brands,serving_size,nutriments,nutriscore_grade,nova_group`);
    
    if (!response.ok) {
      console.log(`[OpenFoodFacts] Product not found: ${barcode}`);
      return null;
    }

    const data = await response.json();
    
    if (data.status !== 1 || !data.product) {
      console.log(`[OpenFoodFacts] Invalid product data for: ${barcode}`);
      return null;
    }

    const product: OpenFoodFactsProduct = data.product;
    const nutriments = product.nutriments || {};

    return {
      barcode: product.code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands,
      servingSize: product.serving_size,
      // Convert per 100g to per serving (assuming 100g serving if not specified)
      calories: nutriments['energy-kcal_100g'],
      protein: nutriments['proteins_100g'],
      carbs: nutriments['carbohydrates_100g'],
      fat: nutriments['fat_100g'],
      fiber: nutriments['fiber_100g'],
      sugars: nutriments['sugars_100g'],
      saturatedFat: nutriments['saturated-fat_100g'],
      sodium: nutriments['sodium_100g'] ? nutriments['sodium_100g'] * 1000 : undefined, // Convert g to mg
      cholesterol: nutriments['cholesterol_100g'] ? nutriments['cholesterol_100g'] * 1000 : undefined, // Convert g to mg
      vitaminA: nutriments['vitamin-a_100g'] ? nutriments['vitamin-a_100g'] * 1000 : undefined, // Convert mg to mcg
      vitaminC: nutriments['vitamin-c_100g'],
      calcium: nutriments['calcium_100g'],
      iron: nutriments['iron_100g'],
      nutriScore: product.nutriscore_grade,
      novaGroup: product.nova_group,
    };
  } catch (error) {
    console.error('[OpenFoodFacts] Error looking up product:', error);
    return null;
  }
}

/**
 * Search for products by name
 */
export async function searchProducts(query: string, limit = 20): Promise<FoodDatabaseProduct[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page_size=${limit}&fields=code,product_name,brands,serving_size,nutriments,nutriscore_grade,nova_group`
    );
    
    if (!response.ok) {
      console.log(`[OpenFoodFacts] Search failed for: ${query}`);
      return [];
    }

    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    return data.products.map((product: OpenFoodFactsProduct) => {
      const nutriments = product.nutriments || {};
      return {
        barcode: product.code,
        name: product.product_name || 'Unknown Product',
        brand: product.brands,
        servingSize: product.serving_size,
        calories: nutriments['energy-kcal_100g'],
        protein: nutriments['proteins_100g'],
        carbs: nutriments['carbohydrates_100g'],
        fat: nutriments['fat_100g'],
        fiber: nutriments['fiber_100g'],
        sugars: nutriments['sugars_100g'],
        saturatedFat: nutriments['saturated-fat_100g'],
        sodium: nutriments['sodium_100g'] ? nutriments['sodium_100g'] * 1000 : undefined,
        cholesterol: nutriments['cholesterol_100g'] ? nutriments['cholesterol_100g'] * 1000 : undefined,
        vitaminA: nutriments['vitamin-a_100g'] ? nutriments['vitamin-a_100g'] * 1000 : undefined,
        vitaminC: nutriments['vitamin-c_100g'],
        calcium: nutriments['calcium_100g'],
        iron: nutriments['iron_100g'],
        nutriScore: product.nutriscore_grade,
        novaGroup: product.nova_group,
      };
    });
  } catch (error) {
    console.error('[OpenFoodFacts] Error searching products:', error);
    return [];
  }
}
