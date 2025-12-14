import { drizzle } from "drizzle-orm/mysql2";
import { mathProblems } from "../drizzle/schema";
import { sql } from "drizzle-orm";

// Database connection
const db = drizzle(process.env.DATABASE_URL!);

/**
 * Comprehensive Math Practice Problem Library - 120 problems
 * 15 problems per topic × 8 topics = 120 total
 * Each topic: 5 beginner + 5 intermediate + 5 advanced
 */

const problemLibrary = [
  // ============================================================================
  // ALGEBRA (15 problems) - Linear equations, quadratics, systems, polynomials, exponentials
  // ============================================================================
  {
    topic: "algebra",
    subtopic: "linear_equations",
    difficulty: "beginner",
    problemText: "Solve for x: 2x + 5 = 13",
    answer: "x = 4",
    solution: JSON.stringify([
      { step: 1, work: "2x + 5 = 13", explanation: "Start with the original equation" },
      { step: 2, work: "2x = 13 - 5", explanation: "Subtract 5 from both sides" },
      { step: 3, work: "2x = 8", explanation: "Simplify the right side" },
      { step: 4, work: "x = 8 / 2", explanation: "Divide both sides by 2" },
      { step: 5, work: "x = 4", explanation: "Final answer" }
    ]),
    hints: JSON.stringify(["Start by isolating the term with x", "Subtract 5 from both sides", "Then divide by the coefficient of x"]),
    explanation: "Linear equations are solved by isolating the variable through inverse operations.",
    relatedConcepts: JSON.stringify(["inverse operations", "equation solving", "variable isolation"])
  },
  {
    topic: "algebra",
    subtopic: "linear_equations",
    difficulty: "beginner",
    problemText: "Solve for y: 3y - 7 = 14",
    answer: "y = 7",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Add 7 to both sides first", "Then divide by 3"]),
    explanation: "Use inverse operations to isolate the variable.",
    relatedConcepts: JSON.stringify(["linear equations", "solving for variables"])
  },
  {
    topic: "algebra",
    subtopic: "linear_equations",
    difficulty: "beginner",
    problemText: "Solve for a: 5a + 3 = 2a + 15",
    answer: "a = 4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Move all terms with 'a' to one side", "Move constants to the other side"]),
    explanation: "Combine like terms on each side of the equation.",
    relatedConcepts: JSON.stringify(["combining like terms", "linear equations"])
  },
  {
    topic: "algebra",
    subtopic: "linear_equations",
    difficulty: "beginner",
    problemText: "Solve for x: x/4 + 2 = 5",
    answer: "x = 12",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Subtract 2 from both sides", "Multiply both sides by 4"]),
    explanation: "Handle fractions by multiplying to clear denominators.",
    relatedConcepts: JSON.stringify(["fractions in equations", "linear equations"])
  },
  {
    topic: "algebra",
    subtopic: "linear_equations",
    difficulty: "beginner",
    problemText: "Solve for m: 2(m + 3) = 14",
    answer: "m = 4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Distribute the 2 first", "Then solve like a regular linear equation"]),
    explanation: "Use the distributive property to expand parentheses.",
    relatedConcepts: JSON.stringify(["distributive property", "linear equations"])
  },
  {
    topic: "algebra",
    subtopic: "quadratic_equations",
    difficulty: "intermediate",
    problemText: "Solve for x: x² - 5x + 6 = 0",
    answer: "x = 2 or x = 3",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Factor the quadratic", "Look for two numbers that multiply to 6 and add to -5"]),
    explanation: "Quadratic equations can be solved by factoring when possible.",
    relatedConcepts: JSON.stringify(["factoring", "quadratic equations", "zero product property"])
  },
  {
    topic: "algebra",
    subtopic: "quadratic_equations",
    difficulty: "intermediate",
    problemText: "Solve for x using the quadratic formula: 2x² + 7x - 4 = 0",
    answer: "x = 0.5 or x = -4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use x = (-b ± √(b² - 4ac)) / 2a", "a = 2, b = 7, c = -4"]),
    explanation: "The quadratic formula works for all quadratic equations.",
    relatedConcepts: JSON.stringify(["quadratic formula", "discriminant"])
  },
  {
    topic: "algebra",
    subtopic: "quadratic_equations",
    difficulty: "intermediate",
    problemText: "Complete the square: x² + 6x + 5 = 0",
    answer: "x = -1 or x = -5",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Move constant to right side", "Add (b/2)² to both sides"]),
    explanation: "Completing the square transforms a quadratic into perfect square form.",
    relatedConcepts: JSON.stringify(["completing the square", "perfect squares"])
  },
  {
    topic: "algebra",
    subtopic: "systems_of_equations",
    difficulty: "intermediate",
    problemText: "Solve the system: 2x + y = 10 and x - y = 2",
    answer: "x = 4, y = 2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Add the equations to eliminate y", "Solve for x first"]),
    explanation: "Systems can be solved by elimination or substitution.",
    relatedConcepts: JSON.stringify(["systems of equations", "elimination method"])
  },
  {
    topic: "algebra",
    subtopic: "polynomials",
    difficulty: "intermediate",
    problemText: "Factor completely: x³ - 8",
    answer: "(x - 2)(x² + 2x + 4)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["This is a difference of cubes", "Use a³ - b³ = (a - b)(a² + ab + b²)"]),
    explanation: "Difference of cubes has a special factoring formula.",
    relatedConcepts: JSON.stringify(["difference of cubes", "factoring"])
  },
  {
    topic: "algebra",
    subtopic: "exponential_equations",
    difficulty: "advanced",
    problemText: "Solve for x: 2^(x+1) = 32",
    answer: "x = 4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Express 32 as a power of 2", "32 = 2^5"]),
    explanation: "Exponential equations are solved by expressing both sides with the same base.",
    relatedConcepts: JSON.stringify(["exponential equations", "powers"])
  },
  {
    topic: "algebra",
    subtopic: "logarithmic_equations",
    difficulty: "advanced",
    problemText: "Solve for x: log₂(x) + log₂(x - 3) = 2",
    answer: "x = 4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use log product rule", "Convert to exponential form"]),
    explanation: "Logarithmic equations use properties of logarithms.",
    relatedConcepts: JSON.stringify(["logarithms", "log properties"])
  },
  {
    topic: "algebra",
    subtopic: "rational_equations",
    difficulty: "advanced",
    problemText: "Solve for x: 1/x + 1/(x+2) = 1/3",
    answer: "x = 1 or x = -6",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find common denominator", "Multiply through to clear fractions"]),
    explanation: "Rational equations require finding a common denominator.",
    relatedConcepts: JSON.stringify(["rational equations", "common denominators"])
  },
  {
    topic: "algebra",
    subtopic: "inequalities",
    difficulty: "advanced",
    problemText: "Solve and graph: |2x - 3| < 5",
    answer: "-1 < x < 4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Split into two inequalities", "-5 < 2x - 3 < 5"]),
    explanation: "Absolute value inequalities split into compound inequalities.",
    relatedConcepts: JSON.stringify(["absolute value", "inequalities"])
  },
  {
    topic: "algebra",
    subtopic: "functions",
    difficulty: "advanced",
    problemText: "Find the inverse of f(x) = 3x - 7",
    answer: "f⁻¹(x) = (x + 7)/3",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Replace f(x) with y", "Swap x and y", "Solve for y"]),
    explanation: "Inverse functions reverse the operation of the original function.",
    relatedConcepts: JSON.stringify(["inverse functions", "function composition"])
  },

  // ============================================================================
  // CALCULUS (15 problems) - Derivatives, integrals, limits, optimization, related rates
  // ============================================================================
  {
    topic: "calculus",
    subtopic: "derivatives",
    difficulty: "beginner",
    problemText: "Find the derivative of f(x) = 3x² + 2x - 5",
    answer: "f'(x) = 6x + 2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use power rule: d/dx(xⁿ) = nxⁿ⁻¹", "Derivative of constant is 0"]),
    explanation: "The power rule is the fundamental derivative rule for polynomials.",
    relatedConcepts: JSON.stringify(["power rule", "derivatives", "polynomials"])
  },
  {
    topic: "calculus",
    subtopic: "derivatives",
    difficulty: "beginner",
    problemText: "Find dy/dx if y = 5x³ - 4x + 7",
    answer: "dy/dx = 15x² - 4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Apply power rule to each term", "Constant term disappears"]),
    explanation: "Differentiate term by term using the power rule.",
    relatedConcepts: JSON.stringify(["power rule", "term-by-term differentiation"])
  },
  {
    topic: "calculus",
    subtopic: "derivatives",
    difficulty: "beginner",
    problemText: "Find the derivative of f(x) = x⁴",
    answer: "f'(x) = 4x³",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use power rule directly"]),
    explanation: "Power rule: bring down the exponent and reduce it by 1.",
    relatedConcepts: JSON.stringify(["power rule"])
  },
  {
    topic: "calculus",
    subtopic: "derivatives",
    difficulty: "beginner",
    problemText: "Find f'(x) if f(x) = 2x + 8",
    answer: "f'(x) = 2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Derivative of linear function is the slope"]),
    explanation: "The derivative of a linear function is its constant slope.",
    relatedConcepts: JSON.stringify(["linear functions", "constant derivatives"])
  },
  {
    topic: "calculus",
    subtopic: "derivatives",
    difficulty: "beginner",
    problemText: "Find the derivative of y = √x",
    answer: "dy/dx = 1/(2√x)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Rewrite as x^(1/2)", "Apply power rule"]),
    explanation: "Rewrite roots as fractional exponents before differentiating.",
    relatedConcepts: JSON.stringify(["power rule", "fractional exponents"])
  },
  {
    topic: "calculus",
    subtopic: "chain_rule",
    difficulty: "intermediate",
    problemText: "Find the derivative of f(x) = (3x + 2)⁵",
    answer: "f'(x) = 15(3x + 2)⁴",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use chain rule", "Outer function is u⁵, inner is 3x + 2"]),
    explanation: "Chain rule: derivative of outer times derivative of inner.",
    relatedConcepts: JSON.stringify(["chain rule", "composite functions"])
  },
  {
    topic: "calculus",
    subtopic: "product_rule",
    difficulty: "intermediate",
    problemText: "Find the derivative of f(x) = x² · sin(x)",
    answer: "f'(x) = 2x·sin(x) + x²·cos(x)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use product rule: (uv)' = u'v + uv'", "u = x², v = sin(x)"]),
    explanation: "Product rule is used when differentiating products of functions.",
    relatedConcepts: JSON.stringify(["product rule", "trigonometric derivatives"])
  },
  {
    topic: "calculus",
    subtopic: "quotient_rule",
    difficulty: "intermediate",
    problemText: "Find the derivative of f(x) = (2x + 1)/(x² + 1)",
    answer: "f'(x) = (2 - 4x² - 2x)/(x² + 1)²",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use quotient rule: (u/v)' = (u'v - uv')/v²"]),
    explanation: "Quotient rule is used for derivatives of fractions.",
    relatedConcepts: JSON.stringify(["quotient rule", "rational functions"])
  },
  {
    topic: "calculus",
    subtopic: "integrals",
    difficulty: "intermediate",
    problemText: "Evaluate ∫(3x² + 2x) dx",
    answer: "x³ + x² + C",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use power rule for integration", "Add constant of integration"]),
    explanation: "Integration is the reverse of differentiation.",
    relatedConcepts: JSON.stringify(["integration", "antiderivatives"])
  },
  {
    topic: "calculus",
    subtopic: "definite_integrals",
    difficulty: "intermediate",
    problemText: "Evaluate ∫₀² (2x + 1) dx",
    answer: "6",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find antiderivative first", "Evaluate at bounds and subtract"]),
    explanation: "Definite integrals give the area under a curve.",
    relatedConcepts: JSON.stringify(["definite integrals", "fundamental theorem of calculus"])
  },
  {
    topic: "calculus",
    subtopic: "limits",
    difficulty: "advanced",
    problemText: "Find lim(x→0) (sin(x)/x)",
    answer: "1",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["This is a standard limit", "Use L'Hôpital's rule or known result"]),
    explanation: "This is a fundamental limit in calculus.",
    relatedConcepts: JSON.stringify(["limits", "trigonometric limits"])
  },
  {
    topic: "calculus",
    subtopic: "optimization",
    difficulty: "advanced",
    problemText: "Find the maximum value of f(x) = -x² + 4x + 1",
    answer: "5 (at x = 2)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find critical points by setting f'(x) = 0", "Check second derivative"]),
    explanation: "Optimization uses derivatives to find maximum and minimum values.",
    relatedConcepts: JSON.stringify(["optimization", "critical points", "second derivative test"])
  },
  {
    topic: "calculus",
    subtopic: "related_rates",
    difficulty: "advanced",
    problemText: "A balloon's radius increases at 2 cm/s. How fast is volume increasing when r = 5 cm?",
    answer: "200π cm³/s",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["V = (4/3)πr³", "Use chain rule: dV/dt = (dV/dr)(dr/dt)"]),
    explanation: "Related rates problems use the chain rule to connect rates of change.",
    relatedConcepts: JSON.stringify(["related rates", "chain rule", "implicit differentiation"])
  },
  {
    topic: "calculus",
    subtopic: "integration_by_parts",
    difficulty: "advanced",
    problemText: "Evaluate ∫x·eˣ dx",
    answer: "x·eˣ - eˣ + C",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use integration by parts: ∫u dv = uv - ∫v du", "Let u = x, dv = eˣ dx"]),
    explanation: "Integration by parts is used for products of functions.",
    relatedConcepts: JSON.stringify(["integration by parts", "exponential functions"])
  },
  {
    topic: "calculus",
    subtopic: "implicit_differentiation",
    difficulty: "advanced",
    problemText: "Find dy/dx if x² + y² = 25",
    answer: "dy/dx = -x/y",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Differentiate both sides with respect to x", "Remember y is a function of x"]),
    explanation: "Implicit differentiation is used when y is not explicitly solved.",
    relatedConcepts: JSON.stringify(["implicit differentiation", "chain rule"])
  },

  // ============================================================================
  // GEOMETRY (15 problems)
  // ============================================================================
  {
    topic: "geometry",
    subtopic: "triangles",
    difficulty: "beginner",
    problemText: "Find the area of a triangle with base 8 cm and height 5 cm",
    answer: "20 cm²",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: Area = (1/2) × base × height"]),
    explanation: "Triangle area is half the product of base and height.",
    relatedConcepts: JSON.stringify(["triangle area", "basic geometry"])
  },
  {
    topic: "geometry",
    subtopic: "triangles",
    difficulty: "beginner",
    problemText: "Find the perimeter of a triangle with sides 3 cm, 4 cm, and 5 cm",
    answer: "12 cm",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Add all three sides"]),
    explanation: "Perimeter is the sum of all sides.",
    relatedConcepts: JSON.stringify(["perimeter", "triangles"])
  },
  {
    topic: "geometry",
    subtopic: "pythagorean_theorem",
    difficulty: "beginner",
    problemText: "Find the hypotenuse of a right triangle with legs 3 and 4",
    answer: "5",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use Pythagorean theorem: a² + b² = c²"]),
    explanation: "Pythagorean theorem relates the sides of a right triangle.",
    relatedConcepts: JSON.stringify(["Pythagorean theorem", "right triangles"])
  },
  {
    topic: "geometry",
    subtopic: "circles",
    difficulty: "beginner",
    problemText: "Find the circumference of a circle with radius 7 cm",
    answer: "14π cm or approximately 43.98 cm",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: C = 2πr"]),
    explanation: "Circumference is the distance around a circle.",
    relatedConcepts: JSON.stringify(["circumference", "circles"])
  },
  {
    topic: "geometry",
    subtopic: "circles",
    difficulty: "beginner",
    problemText: "Find the area of a circle with radius 6 cm",
    answer: "36π cm² or approximately 113.1 cm²",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: A = πr²"]),
    explanation: "Circle area uses the square of the radius.",
    relatedConcepts: JSON.stringify(["circle area", "pi"])
  },
  {
    topic: "geometry",
    subtopic: "rectangles",
    difficulty: "intermediate",
    problemText: "A rectangle has perimeter 30 cm and length 10 cm. Find its area.",
    answer: "50 cm²",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find width first using perimeter formula", "Then calculate area"]),
    explanation: "Use perimeter to find missing dimension, then calculate area.",
    relatedConcepts: JSON.stringify(["rectangles", "perimeter", "area"])
  },
  {
    topic: "geometry",
    subtopic: "similar_triangles",
    difficulty: "intermediate",
    problemText: "Two similar triangles have corresponding sides 4 and 6. If the smaller has area 8 cm², find the larger triangle's area.",
    answer: "18 cm²",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Ratio of areas equals square of ratio of sides", "(6/4)² = 9/4"]),
    explanation: "Similar figures have areas proportional to the square of corresponding sides.",
    relatedConcepts: JSON.stringify(["similar triangles", "area ratios"])
  },
  {
    topic: "geometry",
    subtopic: "volume",
    difficulty: "intermediate",
    problemText: "Find the volume of a cylinder with radius 3 cm and height 10 cm",
    answer: "90π cm³ or approximately 282.7 cm³",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: V = πr²h"]),
    explanation: "Cylinder volume is the area of the base times height.",
    relatedConcepts: JSON.stringify(["cylinder volume", "3D geometry"])
  },
  {
    topic: "geometry",
    subtopic: "surface_area",
    difficulty: "intermediate",
    problemText: "Find the surface area of a cube with side length 4 cm",
    answer: "96 cm²",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["A cube has 6 faces", "Each face is a square"]),
    explanation: "Cube surface area is 6 times the area of one face.",
    relatedConcepts: JSON.stringify(["surface area", "cubes"])
  },
  {
    topic: "geometry",
    subtopic: "angles",
    difficulty: "intermediate",
    problemText: "Two angles are supplementary. One angle is 3 times the other. Find both angles.",
    answer: "45° and 135°",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Supplementary angles sum to 180°", "Set up equation: x + 3x = 180"]),
    explanation: "Supplementary angles add up to 180 degrees.",
    relatedConcepts: JSON.stringify(["supplementary angles", "angle relationships"])
  },
  {
    topic: "geometry",
    subtopic: "coordinate_geometry",
    difficulty: "advanced",
    problemText: "Find the distance between points (2, 3) and (5, 7)",
    answer: "5",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use distance formula: d = √[(x₂-x₁)² + (y₂-y₁)²]"]),
    explanation: "Distance formula comes from the Pythagorean theorem.",
    relatedConcepts: JSON.stringify(["distance formula", "coordinate geometry"])
  },
  {
    topic: "geometry",
    subtopic: "circles",
    difficulty: "advanced",
    problemText: "Find the equation of a circle with center (2, -3) and radius 5",
    answer: "(x - 2)² + (y + 3)² = 25",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use standard form: (x - h)² + (y - k)² = r²"]),
    explanation: "Circle equation uses center coordinates and radius.",
    relatedConcepts: JSON.stringify(["circle equations", "standard form"])
  },
  {
    topic: "geometry",
    subtopic: "sphere",
    difficulty: "advanced",
    problemText: "Find the volume of a sphere with radius 6 cm",
    answer: "288π cm³ or approximately 904.8 cm³",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: V = (4/3)πr³"]),
    explanation: "Sphere volume uses the cube of the radius.",
    relatedConcepts: JSON.stringify(["sphere volume", "3D geometry"])
  },
  {
    topic: "geometry",
    subtopic: "polygons",
    difficulty: "advanced",
    problemText: "Find the sum of interior angles of a hexagon",
    answer: "720°",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: (n - 2) × 180°", "Hexagon has 6 sides"]),
    explanation: "Interior angle sum depends on the number of sides.",
    relatedConcepts: JSON.stringify(["polygons", "interior angles"])
  },
  {
    topic: "geometry",
    subtopic: "conic_sections",
    difficulty: "advanced",
    problemText: "Identify the conic section: x²/9 + y²/16 = 1",
    answer: "Ellipse",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Both variables are squared and positive", "Different denominators"]),
    explanation: "This is the standard form of an ellipse.",
    relatedConcepts: JSON.stringify(["ellipse", "conic sections"])
  },

  // ============================================================================
  // TRIGONOMETRY (15 problems)
  // ============================================================================
  {
    topic: "trigonometry",
    subtopic: "basic_ratios",
    difficulty: "beginner",
    problemText: "In a right triangle, if the opposite side is 3 and the hypotenuse is 5, find sin(θ)",
    answer: "3/5 or 0.6",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["sin(θ) = opposite/hypotenuse"]),
    explanation: "Sine is the ratio of opposite side to hypotenuse.",
    relatedConcepts: JSON.stringify(["sine", "trigonometric ratios"])
  },
  {
    topic: "trigonometry",
    subtopic: "basic_ratios",
    difficulty: "beginner",
    problemText: "If cos(θ) = 4/5, find the adjacent side when the hypotenuse is 10",
    answer: "8",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["cos(θ) = adjacent/hypotenuse", "Set up proportion"]),
    explanation: "Cosine relates the adjacent side to the hypotenuse.",
    relatedConcepts: JSON.stringify(["cosine", "proportions"])
  },
  {
    topic: "trigonometry",
    subtopic: "basic_ratios",
    difficulty: "beginner",
    problemText: "Find tan(45°)",
    answer: "1",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["45-45-90 triangle has equal legs", "tan = opposite/adjacent"]),
    explanation: "Special angles have exact trigonometric values.",
    relatedConcepts: JSON.stringify(["tangent", "special angles"])
  },
  {
    topic: "trigonometry",
    subtopic: "unit_circle",
    difficulty: "beginner",
    problemText: "Find sin(30°)",
    answer: "1/2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use 30-60-90 triangle", "Or memorize unit circle value"]),
    explanation: "30° is a special angle with exact value.",
    relatedConcepts: JSON.stringify(["unit circle", "special angles"])
  },
  {
    topic: "trigonometry",
    subtopic: "unit_circle",
    difficulty: "beginner",
    problemText: "Find cos(60°)",
    answer: "1/2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use 30-60-90 triangle"]),
    explanation: "60° is complementary to 30°.",
    relatedConcepts: JSON.stringify(["unit circle", "complementary angles"])
  },
  {
    topic: "trigonometry",
    subtopic: "identities",
    difficulty: "intermediate",
    problemText: "Verify the identity: sin²(θ) + cos²(θ) = 1",
    answer: "Identity verified",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["This is the Pythagorean identity", "Comes from x² + y² = 1 on unit circle"]),
    explanation: "The Pythagorean identity is fundamental in trigonometry.",
    relatedConcepts: JSON.stringify(["Pythagorean identity", "trigonometric identities"])
  },
  {
    topic: "trigonometry",
    subtopic: "identities",
    difficulty: "intermediate",
    problemText: "Simplify: tan(θ) × cos(θ)",
    answer: "sin(θ)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Write tan(θ) as sin(θ)/cos(θ)", "Cancel cos(θ)"]),
    explanation: "Use the definition of tangent to simplify.",
    relatedConcepts: JSON.stringify(["tangent identity", "simplification"])
  },
  {
    topic: "trigonometry",
    subtopic: "equations",
    difficulty: "intermediate",
    problemText: "Solve for θ (0° ≤ θ ≤ 360°): 2sin(θ) = 1",
    answer: "θ = 30° or 150°",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["sin(θ) = 1/2", "Find all solutions in given range"]),
    explanation: "Trigonometric equations may have multiple solutions.",
    relatedConcepts: JSON.stringify(["trigonometric equations", "multiple solutions"])
  },
  {
    topic: "trigonometry",
    subtopic: "graphs",
    difficulty: "intermediate",
    problemText: "Find the amplitude of y = 3sin(x)",
    answer: "3",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Amplitude is the coefficient of sine"]),
    explanation: "Amplitude is the maximum distance from the midline.",
    relatedConcepts: JSON.stringify(["amplitude", "sine graphs"])
  },
  {
    topic: "trigonometry",
    subtopic: "law_of_sines",
    difficulty: "intermediate",
    problemText: "In triangle ABC, a = 10, A = 30°, B = 45°. Find side b.",
    answer: "b ≈ 14.14",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use Law of Sines: a/sin(A) = b/sin(B)"]),
    explanation: "Law of Sines relates sides and angles in any triangle.",
    relatedConcepts: JSON.stringify(["law of sines", "triangle solving"])
  },
  {
    topic: "trigonometry",
    subtopic: "double_angle",
    difficulty: "advanced",
    problemText: "Use double angle formula to find sin(2θ) if sin(θ) = 3/5 and cos(θ) = 4/5",
    answer: "24/25",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["sin(2θ) = 2sin(θ)cos(θ)"]),
    explanation: "Double angle formulas express trig functions of 2θ.",
    relatedConcepts: JSON.stringify(["double angle formulas", "trigonometric identities"])
  },
  {
    topic: "trigonometry",
    subtopic: "inverse_trig",
    difficulty: "advanced",
    problemText: "Find arcsin(1/2)",
    answer: "30° or π/6 radians",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["What angle has sine equal to 1/2?"]),
    explanation: "Inverse trig functions find angles from ratios.",
    relatedConcepts: JSON.stringify(["inverse trigonometric functions", "arcsine"])
  },
  {
    topic: "trigonometry",
    subtopic: "law_of_cosines",
    difficulty: "advanced",
    problemText: "In triangle ABC, a = 7, b = 10, C = 60°. Find side c.",
    answer: "c ≈ 8.89",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use Law of Cosines: c² = a² + b² - 2ab·cos(C)"]),
    explanation: "Law of Cosines generalizes the Pythagorean theorem.",
    relatedConcepts: JSON.stringify(["law of cosines", "triangle solving"])
  },
  {
    topic: "trigonometry",
    subtopic: "complex_identities",
    difficulty: "advanced",
    problemText: "Prove: (1 + tan²(θ)) = sec²(θ)",
    answer: "Identity proven",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Start with sin²(θ) + cos²(θ) = 1", "Divide by cos²(θ)"]),
    explanation: "This is another Pythagorean identity.",
    relatedConcepts: JSON.stringify(["Pythagorean identities", "secant"])
  },
  {
    topic: "trigonometry",
    subtopic: "radians",
    difficulty: "advanced",
    problemText: "Convert 135° to radians",
    answer: "3π/4 radians",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Multiply by π/180", "Simplify the fraction"]),
    explanation: "Radians are an alternative angle measure.",
    relatedConcepts: JSON.stringify(["radians", "angle conversion"])
  },

  // ============================================================================
  // STATISTICS (15 problems)
  // ============================================================================
  {
    topic: "statistics",
    subtopic: "mean",
    difficulty: "beginner",
    problemText: "Find the mean of: 4, 7, 9, 12, 18",
    answer: "10",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Add all values and divide by count", "Sum = 50, Count = 5"]),
    explanation: "Mean is the average of all values.",
    relatedConcepts: JSON.stringify(["mean", "average", "central tendency"])
  },
  {
    topic: "statistics",
    subtopic: "median",
    difficulty: "beginner",
    problemText: "Find the median of: 3, 7, 9, 15, 20",
    answer: "9",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Arrange in order (already done)", "Middle value is the median"]),
    explanation: "Median is the middle value when data is ordered.",
    relatedConcepts: JSON.stringify(["median", "central tendency"])
  },
  {
    topic: "statistics",
    subtopic: "mode",
    difficulty: "beginner",
    problemText: "Find the mode of: 2, 5, 5, 7, 9, 5, 12",
    answer: "5",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Mode is the most frequent value"]),
    explanation: "Mode is the value that appears most often.",
    relatedConcepts: JSON.stringify(["mode", "frequency"])
  },
  {
    topic: "statistics",
    subtopic: "range",
    difficulty: "beginner",
    problemText: "Find the range of: 12, 18, 25, 30, 42",
    answer: "30",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Range = Maximum - Minimum"]),
    explanation: "Range measures the spread of data.",
    relatedConcepts: JSON.stringify(["range", "spread"])
  },
  {
    topic: "statistics",
    subtopic: "probability",
    difficulty: "beginner",
    problemText: "What is the probability of rolling a 4 on a fair six-sided die?",
    answer: "1/6 or approximately 0.167",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Probability = Favorable outcomes / Total outcomes"]),
    explanation: "Basic probability is the ratio of favorable to total outcomes.",
    relatedConcepts: JSON.stringify(["probability", "dice"])
  },
  {
    topic: "statistics",
    subtopic: "standard_deviation",
    difficulty: "intermediate",
    problemText: "Find the variance of: 2, 4, 6, 8, 10",
    answer: "8",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find mean first (6)", "Calculate squared deviations", "Average the squared deviations"]),
    explanation: "Variance measures how spread out data is from the mean.",
    relatedConcepts: JSON.stringify(["variance", "standard deviation", "spread"])
  },
  {
    topic: "statistics",
    subtopic: "combinations",
    difficulty: "intermediate",
    problemText: "How many ways can you choose 2 items from 5 items?",
    answer: "10",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use combination formula: C(n,r) = n!/(r!(n-r)!)", "C(5,2) = 5!/(2!×3!)"]),
    explanation: "Combinations count selections where order doesn't matter.",
    relatedConcepts: JSON.stringify(["combinations", "counting"])
  },
  {
    topic: "statistics",
    subtopic: "permutations",
    difficulty: "intermediate",
    problemText: "How many ways can you arrange 3 books from a shelf of 5 books?",
    answer: "60",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use permutation formula: P(n,r) = n!/(n-r)!", "P(5,3) = 5!/2!"]),
    explanation: "Permutations count arrangements where order matters.",
    relatedConcepts: JSON.stringify(["permutations", "arrangements"])
  },
  {
    topic: "statistics",
    subtopic: "probability",
    difficulty: "intermediate",
    problemText: "A bag has 3 red and 5 blue marbles. What's the probability of drawing 2 blue marbles without replacement?",
    answer: "5/14 or approximately 0.357",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["First draw: 5/8", "Second draw: 4/7", "Multiply probabilities"]),
    explanation: "For independent events, multiply probabilities.",
    relatedConcepts: JSON.stringify(["conditional probability", "without replacement"])
  },
  {
    topic: "statistics",
    subtopic: "z_scores",
    difficulty: "intermediate",
    problemText: "Find the z-score for x = 85 when mean = 75 and standard deviation = 10",
    answer: "1",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: z = (x - μ) / σ"]),
    explanation: "Z-scores measure how many standard deviations from the mean.",
    relatedConcepts: JSON.stringify(["z-scores", "standardization", "normal distribution"])
  },
  {
    topic: "statistics",
    subtopic: "normal_distribution",
    difficulty: "advanced",
    problemText: "In a normal distribution, what percentage of data falls within 1 standard deviation of the mean?",
    answer: "Approximately 68%",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["This is the empirical rule", "68-95-99.7 rule"]),
    explanation: "The empirical rule describes normal distribution spread.",
    relatedConcepts: JSON.stringify(["normal distribution", "empirical rule"])
  },
  {
    topic: "statistics",
    subtopic: "correlation",
    difficulty: "advanced",
    problemText: "If correlation coefficient r = -0.85, describe the relationship",
    answer: "Strong negative correlation",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["r close to -1 means strong negative", "Negative means inverse relationship"]),
    explanation: "Correlation measures strength and direction of linear relationship.",
    relatedConcepts: JSON.stringify(["correlation", "linear relationships"])
  },
  {
    topic: "statistics",
    subtopic: "hypothesis_testing",
    difficulty: "advanced",
    problemText: "What does a p-value of 0.03 mean at α = 0.05 significance level?",
    answer: "Reject the null hypothesis",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Compare p-value to α", "p < α means reject null"]),
    explanation: "P-value determines statistical significance.",
    relatedConcepts: JSON.stringify(["hypothesis testing", "p-value", "significance"])
  },
  {
    topic: "statistics",
    subtopic: "confidence_intervals",
    difficulty: "advanced",
    problemText: "Interpret: 95% confidence interval for mean is (45, 55)",
    answer: "We are 95% confident the true mean is between 45 and 55",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Confidence interval gives range for parameter"]),
    explanation: "Confidence intervals estimate population parameters.",
    relatedConcepts: JSON.stringify(["confidence intervals", "inference"])
  },
  {
    topic: "statistics",
    subtopic: "regression",
    difficulty: "advanced",
    problemText: "In regression y = 2x + 3, what is the predicted y when x = 5?",
    answer: "13",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Substitute x = 5 into equation"]),
    explanation: "Regression equations predict values.",
    relatedConcepts: JSON.stringify(["linear regression", "prediction"])
  },

  // ============================================================================
  // ARITHMETIC (15 problems)
  // ============================================================================
  {
    topic: "arithmetic",
    subtopic: "fractions",
    difficulty: "beginner",
    problemText: "Simplify: 1/2 + 1/4",
    answer: "3/4",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find common denominator (4)", "Convert 1/2 to 2/4"]),
    explanation: "Add fractions by finding common denominators.",
    relatedConcepts: JSON.stringify(["fractions", "common denominators"])
  },
  {
    topic: "arithmetic",
    subtopic: "fractions",
    difficulty: "beginner",
    problemText: "Multiply: 2/3 × 3/4",
    answer: "1/2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Multiply numerators", "Multiply denominators", "Simplify"]),
    explanation: "Multiply fractions straight across and simplify.",
    relatedConcepts: JSON.stringify(["fraction multiplication", "simplification"])
  },
  {
    topic: "arithmetic",
    subtopic: "decimals",
    difficulty: "beginner",
    problemText: "Calculate: 3.5 + 2.75",
    answer: "6.25",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Line up decimal points", "Add normally"]),
    explanation: "Align decimals before adding.",
    relatedConcepts: JSON.stringify(["decimal addition"])
  },
  {
    topic: "arithmetic",
    subtopic: "percentages",
    difficulty: "beginner",
    problemText: "What is 25% of 80?",
    answer: "20",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Convert 25% to 0.25", "Multiply 0.25 × 80"]),
    explanation: "Convert percent to decimal and multiply.",
    relatedConcepts: JSON.stringify(["percentages", "multiplication"])
  },
  {
    topic: "arithmetic",
    subtopic: "order_of_operations",
    difficulty: "beginner",
    problemText: "Evaluate: 2 + 3 × 4",
    answer: "14",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["PEMDAS: Multiplication before addition", "3 × 4 = 12 first"]),
    explanation: "Follow order of operations (PEMDAS).",
    relatedConcepts: JSON.stringify(["order of operations", "PEMDAS"])
  },
  {
    topic: "arithmetic",
    subtopic: "fractions",
    difficulty: "intermediate",
    problemText: "Divide: 2/3 ÷ 4/5",
    answer: "5/6",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Multiply by reciprocal", "2/3 × 5/4"]),
    explanation: "Dividing fractions means multiplying by the reciprocal.",
    relatedConcepts: JSON.stringify(["fraction division", "reciprocals"])
  },
  {
    topic: "arithmetic",
    subtopic: "percentages",
    difficulty: "intermediate",
    problemText: "A shirt costs $40 and is on sale for 30% off. What is the sale price?",
    answer: "$28",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find 30% of 40", "Subtract from original price"]),
    explanation: "Calculate discount and subtract from original.",
    relatedConcepts: JSON.stringify(["percentages", "discounts"])
  },
  {
    topic: "arithmetic",
    subtopic: "ratios",
    difficulty: "intermediate",
    problemText: "If the ratio of boys to girls is 3:5 and there are 15 boys, how many girls are there?",
    answer: "25",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Set up proportion: 3/5 = 15/x", "Cross multiply"]),
    explanation: "Use proportions to solve ratio problems.",
    relatedConcepts: JSON.stringify(["ratios", "proportions"])
  },
  {
    topic: "arithmetic",
    subtopic: "exponents",
    difficulty: "intermediate",
    problemText: "Simplify: 2³ × 2⁴",
    answer: "2⁷ or 128",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["When multiplying same base, add exponents", "3 + 4 = 7"]),
    explanation: "Product of powers rule: add exponents.",
    relatedConcepts: JSON.stringify(["exponents", "power rules"])
  },
  {
    topic: "arithmetic",
    subtopic: "square_roots",
    difficulty: "intermediate",
    problemText: "Simplify: √48",
    answer: "4√3",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Factor 48 = 16 × 3", "√16 = 4"]),
    explanation: "Simplify by factoring out perfect squares.",
    relatedConcepts: JSON.stringify(["square roots", "simplification"])
  },
  {
    topic: "arithmetic",
    subtopic: "complex_fractions",
    difficulty: "advanced",
    problemText: "Simplify: (1/2 + 1/3) / (1/4 + 1/6)",
    answer: "2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Simplify numerator first", "Then denominator", "Divide"]),
    explanation: "Complex fractions require step-by-step simplification.",
    relatedConcepts: JSON.stringify(["complex fractions", "order of operations"])
  },
  {
    topic: "arithmetic",
    subtopic: "scientific_notation",
    difficulty: "advanced",
    problemText: "Express 0.00045 in scientific notation",
    answer: "4.5 × 10⁻⁴",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Move decimal to get number between 1 and 10", "Count places moved"]),
    explanation: "Scientific notation expresses very large or small numbers.",
    relatedConcepts: JSON.stringify(["scientific notation", "powers of 10"])
  },
  {
    topic: "arithmetic",
    subtopic: "compound_interest",
    difficulty: "advanced",
    problemText: "Find the amount after 2 years if $1000 is invested at 5% annual interest compounded annually",
    answer: "$1102.50",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: A = P(1 + r)ⁿ", "P = 1000, r = 0.05, n = 2"]),
    explanation: "Compound interest grows exponentially.",
    relatedConcepts: JSON.stringify(["compound interest", "exponential growth"])
  },
  {
    topic: "arithmetic",
    subtopic: "absolute_value",
    difficulty: "advanced",
    problemText: "Solve: |2x - 3| = 7",
    answer: "x = 5 or x = -2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Split into two equations", "2x - 3 = 7 or 2x - 3 = -7"]),
    explanation: "Absolute value equations have two solutions.",
    relatedConcepts: JSON.stringify(["absolute value", "equations"])
  },
  {
    topic: "arithmetic",
    subtopic: "sequences",
    difficulty: "advanced",
    problemText: "Find the 10th term of the arithmetic sequence: 3, 7, 11, 15, ...",
    answer: "39",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find common difference (4)", "Use formula: aₙ = a₁ + (n-1)d"]),
    explanation: "Arithmetic sequences have constant differences.",
    relatedConcepts: JSON.stringify(["arithmetic sequences", "patterns"])
  },

  // ============================================================================
  // LINEAR ALGEBRA (15 problems)
  // ============================================================================
  {
    topic: "linear_algebra",
    subtopic: "matrices",
    difficulty: "beginner",
    problemText: "Add matrices: [[1,2],[3,4]] + [[5,6],[7,8]]",
    answer: "[[6,8],[10,12]]",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Add corresponding elements"]),
    explanation: "Matrix addition is element-wise.",
    relatedConcepts: JSON.stringify(["matrix addition", "matrices"])
  },
  {
    topic: "linear_algebra",
    subtopic: "matrices",
    difficulty: "beginner",
    problemText: "Multiply matrix by scalar: 3 × [[1,2],[3,4]]",
    answer: "[[3,6],[9,12]]",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Multiply each element by 3"]),
    explanation: "Scalar multiplication multiplies every element.",
    relatedConcepts: JSON.stringify(["scalar multiplication", "matrices"])
  },
  {
    topic: "linear_algebra",
    subtopic: "vectors",
    difficulty: "beginner",
    problemText: "Find the magnitude of vector v = (3, 4)",
    answer: "5",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: |v| = √(x² + y²)", "√(9 + 16) = √25"]),
    explanation: "Vector magnitude is found using Pythagorean theorem.",
    relatedConcepts: JSON.stringify(["vector magnitude", "vectors"])
  },
  {
    topic: "linear_algebra",
    subtopic: "dot_product",
    difficulty: "beginner",
    problemText: "Find the dot product of (2, 3) and (4, 5)",
    answer: "23",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Multiply corresponding components and add", "2×4 + 3×5"]),
    explanation: "Dot product multiplies components and sums.",
    relatedConcepts: JSON.stringify(["dot product", "vectors"])
  },
  {
    topic: "linear_algebra",
    subtopic: "vectors",
    difficulty: "beginner",
    problemText: "Add vectors: (1, 2, 3) + (4, 5, 6)",
    answer: "(5, 7, 9)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Add corresponding components"]),
    explanation: "Vector addition is component-wise.",
    relatedConcepts: JSON.stringify(["vector addition"])
  },
  {
    topic: "linear_algebra",
    subtopic: "matrix_multiplication",
    difficulty: "intermediate",
    problemText: "Multiply: [[1,2],[3,4]] × [[2,0],[1,3]]",
    answer: "[[4,6],[10,12]]",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Row × Column", "First row: [1,2]×[2,1] and [1,2]×[0,3]"]),
    explanation: "Matrix multiplication uses row-column products.",
    relatedConcepts: JSON.stringify(["matrix multiplication"])
  },
  {
    topic: "linear_algebra",
    subtopic: "determinants",
    difficulty: "intermediate",
    problemText: "Find the determinant of [[2,3],[1,4]]",
    answer: "5",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["For 2×2: ad - bc", "2×4 - 3×1"]),
    explanation: "Determinant measures matrix properties.",
    relatedConcepts: JSON.stringify(["determinants", "2×2 matrices"])
  },
  {
    topic: "linear_algebra",
    subtopic: "inverse",
    difficulty: "intermediate",
    problemText: "Find the inverse of [[1,2],[3,4]]",
    answer: "[[-2,1],[1.5,-0.5]]",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: (1/det) × [[d,-b],[-c,a]]", "det = -2"]),
    explanation: "Matrix inverse reverses matrix multiplication.",
    relatedConcepts: JSON.stringify(["matrix inverse", "determinants"])
  },
  {
    topic: "linear_algebra",
    subtopic: "systems",
    difficulty: "intermediate",
    problemText: "Solve using matrices: x + 2y = 5, 3x + 4y = 11",
    answer: "x = 1, y = 2",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Write as matrix equation Ax = b", "Solve using inverse or elimination"]),
    explanation: "Systems of equations can be solved with matrices.",
    relatedConcepts: JSON.stringify(["systems of equations", "matrix methods"])
  },
  {
    topic: "linear_algebra",
    subtopic: "cross_product",
    difficulty: "intermediate",
    problemText: "Find the cross product of (1, 0, 0) and (0, 1, 0)",
    answer: "(0, 0, 1)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use determinant method", "Result is perpendicular to both"]),
    explanation: "Cross product gives perpendicular vector.",
    relatedConcepts: JSON.stringify(["cross product", "3D vectors"])
  },
  {
    topic: "linear_algebra",
    subtopic: "eigenvalues",
    difficulty: "advanced",
    problemText: "Find eigenvalues of [[2,1],[1,2]]",
    answer: "λ = 3 or λ = 1",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Solve det(A - λI) = 0", "Get characteristic equation"]),
    explanation: "Eigenvalues are special scalars for a matrix.",
    relatedConcepts: JSON.stringify(["eigenvalues", "characteristic equation"])
  },
  {
    topic: "linear_algebra",
    subtopic: "linear_independence",
    difficulty: "advanced",
    problemText: "Are vectors (1,2) and (2,4) linearly independent?",
    answer: "No, they are linearly dependent",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Check if one is a scalar multiple of the other", "(2,4) = 2×(1,2)"]),
    explanation: "Linearly dependent vectors are scalar multiples.",
    relatedConcepts: JSON.stringify(["linear independence", "span"])
  },
  {
    topic: "linear_algebra",
    subtopic: "projections",
    difficulty: "advanced",
    problemText: "Find the projection of (3,4) onto (1,0)",
    answer: "(3,0)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use formula: proj_u(v) = (v·u/|u|²)u"]),
    explanation: "Projection finds the component in a direction.",
    relatedConcepts: JSON.stringify(["vector projection", "dot product"])
  },
  {
    topic: "linear_algebra",
    subtopic: "rank",
    difficulty: "advanced",
    problemText: "Find the rank of [[1,2,3],[2,4,6]]",
    answer: "1",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Second row is 2× first row", "Only 1 independent row"]),
    explanation: "Rank is the number of linearly independent rows.",
    relatedConcepts: JSON.stringify(["matrix rank", "linear independence"])
  },
  {
    topic: "linear_algebra",
    subtopic: "orthogonality",
    difficulty: "advanced",
    problemText: "Are vectors (1,2) and (-2,1) orthogonal?",
    answer: "Yes",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Check if dot product is 0", "1×(-2) + 2×1 = 0"]),
    explanation: "Orthogonal vectors have dot product of zero.",
    relatedConcepts: JSON.stringify(["orthogonality", "dot product"])
  },

  // ============================================================================
  // DIFFERENTIAL EQUATIONS (15 problems)
  // ============================================================================
  {
    topic: "differential_equations",
    subtopic: "separable",
    difficulty: "beginner",
    problemText: "Solve: dy/dx = 2x",
    answer: "y = x² + C",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Integrate both sides", "∫dy = ∫2x dx"]),
    explanation: "Separable equations can be solved by integration.",
    relatedConcepts: JSON.stringify(["separable equations", "integration"])
  },
  {
    topic: "differential_equations",
    subtopic: "separable",
    difficulty: "beginner",
    problemText: "Solve: dy/dx = y",
    answer: "y = Ce^x",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Separate variables: dy/y = dx", "Integrate both sides"]),
    explanation: "This is exponential growth/decay.",
    relatedConcepts: JSON.stringify(["exponential functions", "separable equations"])
  },
  {
    topic: "differential_equations",
    subtopic: "initial_value",
    difficulty: "beginner",
    problemText: "Solve: dy/dx = 3x², y(0) = 1",
    answer: "y = x³ + 1",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Integrate to get y = x³ + C", "Use y(0) = 1 to find C"]),
    explanation: "Initial conditions determine the constant.",
    relatedConcepts: JSON.stringify(["initial value problems", "integration"])
  },
  {
    topic: "differential_equations",
    subtopic: "first_order",
    difficulty: "beginner",
    problemText: "Verify that y = 2e^x is a solution to dy/dx = y",
    answer: "Verified: dy/dx = 2e^x = y",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Take derivative of y", "Check if it equals y"]),
    explanation: "Verify solutions by substitution.",
    relatedConcepts: JSON.stringify(["solution verification", "derivatives"])
  },
  {
    topic: "differential_equations",
    subtopic: "linear_first_order",
    difficulty: "beginner",
    problemText: "Identify if dy/dx + 2y = 0 is linear",
    answer: "Yes, it is linear first-order",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Linear means y and dy/dx appear to first power only"]),
    explanation: "Linear DEs have standard solution methods.",
    relatedConcepts: JSON.stringify(["linear differential equations", "classification"])
  },
  {
    topic: "differential_equations",
    subtopic: "separable",
    difficulty: "intermediate",
    problemText: "Solve: dy/dx = xy",
    answer: "y = Ce^(x²/2)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Separate: dy/y = x dx", "Integrate both sides"]),
    explanation: "Separable equations split variables to opposite sides.",
    relatedConcepts: JSON.stringify(["separable equations", "exponential solutions"])
  },
  {
    topic: "differential_equations",
    subtopic: "linear_first_order",
    difficulty: "intermediate",
    problemText: "Solve: dy/dx + y = e^x",
    answer: "y = (x/2 + C)e^x",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Use integrating factor method", "μ(x) = e^x"]),
    explanation: "Integrating factors solve linear first-order DEs.",
    relatedConcepts: JSON.stringify(["integrating factor", "linear equations"])
  },
  {
    topic: "differential_equations",
    subtopic: "second_order",
    difficulty: "intermediate",
    problemText: "Find the general solution: y'' - 4y = 0",
    answer: "y = C₁e^(2x) + C₂e^(-2x)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Characteristic equation: r² - 4 = 0", "r = ±2"]),
    explanation: "Second-order DEs use characteristic equations.",
    relatedConcepts: JSON.stringify(["second-order equations", "characteristic equation"])
  },
  {
    topic: "differential_equations",
    subtopic: "homogeneous",
    difficulty: "intermediate",
    problemText: "Solve: y'' + 4y' + 4y = 0",
    answer: "y = (C₁ + C₂x)e^(-2x)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Characteristic equation: r² + 4r + 4 = 0", "Repeated root r = -2"]),
    explanation: "Repeated roots require special solution form.",
    relatedConcepts: JSON.stringify(["repeated roots", "homogeneous equations"])
  },
  {
    topic: "differential_equations",
    subtopic: "applications",
    difficulty: "intermediate",
    problemText: "A population grows at rate dP/dt = 0.05P. If P(0) = 100, find P(t)",
    answer: "P(t) = 100e^(0.05t)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Separable equation", "Exponential growth model"]),
    explanation: "Exponential growth models population dynamics.",
    relatedConcepts: JSON.stringify(["exponential growth", "applications"])
  },
  {
    topic: "differential_equations",
    subtopic: "nonhomogeneous",
    difficulty: "advanced",
    problemText: "Solve: y'' + y = sin(x)",
    answer: "y = C₁cos(x) + C₂sin(x) - (x/2)cos(x)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Find complementary solution first", "Use method of undetermined coefficients"]),
    explanation: "Nonhomogeneous DEs have particular + complementary solutions.",
    relatedConcepts: JSON.stringify(["nonhomogeneous equations", "particular solutions"])
  },
  {
    topic: "differential_equations",
    subtopic: "systems",
    difficulty: "advanced",
    problemText: "Solve the system: dx/dt = y, dy/dt = -x",
    answer: "x = C₁cos(t) + C₂sin(t), y = -C₁sin(t) + C₂cos(t)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["This represents circular motion", "Eigenvalue approach"]),
    explanation: "Systems of DEs model coupled phenomena.",
    relatedConcepts: JSON.stringify(["systems of DEs", "eigenvalues"])
  },
  {
    topic: "differential_equations",
    subtopic: "laplace_transform",
    difficulty: "advanced",
    problemText: "Use Laplace transform to solve: y' + 2y = 0, y(0) = 3",
    answer: "y = 3e^(-2t)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Take Laplace of both sides", "Solve for Y(s)", "Inverse transform"]),
    explanation: "Laplace transforms convert DEs to algebra.",
    relatedConcepts: JSON.stringify(["Laplace transform", "transform methods"])
  },
  {
    topic: "differential_equations",
    subtopic: "boundary_value",
    difficulty: "advanced",
    problemText: "Solve: y'' + π²y = 0, y(0) = 0, y(1) = 0",
    answer: "y = C·sin(πx)",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["General solution: y = Acos(πx) + Bsin(πx)", "Apply boundary conditions"]),
    explanation: "Boundary value problems have conditions at multiple points.",
    relatedConcepts: JSON.stringify(["boundary value problems", "eigenvalue problems"])
  },
  {
    topic: "differential_equations",
    subtopic: "series_solutions",
    difficulty: "advanced",
    problemText: "Find the first three terms of the power series solution to y' = y, y(0) = 1",
    answer: "y ≈ 1 + x + x²/2 + ...",
    solution: JSON.stringify([]),
    hints: JSON.stringify(["Assume y = Σaₙxⁿ", "Match coefficients"]),
    explanation: "Series solutions work when other methods fail.",
    relatedConcepts: JSON.stringify(["power series", "series solutions"])
  }
];

async function seedProblems() {
  console.log("🗑️  Clearing existing math problems...");
  
  // Clear existing problems
  await db.delete(mathProblems);
  
  console.log(`📚 Seeding ${problemLibrary.length} math problems...`);

  // Insert all problems
  for (const problem of problemLibrary) {
    try {
      await db.insert(mathProblems).values(problem);
    } catch (error) {
      console.error(`Error inserting problem: ${problem.problemText}`, error);
    }
  }

  console.log("✅ Math problem library seeded successfully!");
  console.log(`Total problems: ${problemLibrary.length}`);
  console.log("Topics covered: Algebra, Calculus, Geometry, Trigonometry, Statistics, Arithmetic, Linear Algebra, Differential Equations");
  
  // Verify distribution
  const distribution = await db.execute(sql`
    SELECT topic, difficulty, COUNT(*) as count 
    FROM math_problems 
    GROUP BY topic, difficulty 
    ORDER BY topic, difficulty
  `);
  
  console.log("\n📊 Problem Distribution:");
  console.table(distribution.rows);
  
  process.exit(0);
}

seedProblems();
