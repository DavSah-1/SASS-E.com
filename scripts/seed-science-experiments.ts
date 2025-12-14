import { drizzle } from "drizzle-orm/mysql2";
import { experiments, experimentSteps } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const experimentsData = [
  // Physics Experiments (10)
  {
    title: "Newton's First Law: Inertia Demonstration",
    category: "physics" as const,
    difficulty: "beginner" as const,
    description: "Observe how objects at rest stay at rest and objects in motion stay in motion unless acted upon by an external force.",
    equipment: JSON.stringify(["Coin", "Playing card", "Cup", "Smooth table surface"]),
    safetyWarnings: JSON.stringify(["Ensure the table surface is clear of obstacles"]),
    duration: 15,
    learningObjectives: JSON.stringify([
      "Understand Newton's First Law of Motion",
      "Observe inertia in action",
      "Explain the relationship between mass and inertia"
    ]),
    backgroundInfo: "Newton's First Law states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force. This property of matter is called inertia.",
    steps: [
      { stepNumber: 1, instruction: "Place the playing card on top of the cup", expectedResult: "Card rests stably on cup rim", safetyNote: null },
      { stepNumber: 2, instruction: "Place the coin in the center of the card", expectedResult: "Coin balances on the card", safetyNote: null },
      { stepNumber: 3, instruction: "Quickly flick the card horizontally off the cup", expectedResult: "Card flies away but coin drops straight into the cup", safetyNote: "Use a smooth, quick motion" },
      { stepNumber: 4, instruction: "Repeat with different coin sizes", expectedResult: "Heavier coins demonstrate greater inertia", safetyNote: null }
    ]
  },
  {
    title: "Simple Pendulum and Period",
    category: "physics" as const,
    difficulty: "intermediate" as const,
    description: "Investigate how the length of a pendulum affects its period of oscillation.",
    equipment: JSON.stringify(["String", "Small weight", "Stopwatch", "Ruler", "Stand or hook"]),
    safetyWarnings: JSON.stringify(["Ensure the weight is securely attached", "Keep clear of swinging pendulum"]),
    duration: 30,
    learningObjectives: JSON.stringify([
      "Measure the period of a pendulum",
      "Understand the relationship between length and period",
      "Apply the pendulum formula"
    ]),
    backgroundInfo: "The period of a simple pendulum depends only on its length and gravity, not on the mass of the bob or the amplitude of swing (for small angles).",
    steps: [
      { stepNumber: 1, instruction: "Set up pendulum with 50cm string length", expectedResult: "Pendulum hangs freely", safetyNote: "Secure the string firmly" },
      { stepNumber: 2, instruction: "Pull the pendulum 15° from vertical and release", expectedResult: "Pendulum swings smoothly", safetyNote: "Use small angles only" },
      { stepNumber: 3, instruction: "Time 10 complete oscillations", expectedResult: "Consistent timing", safetyNote: null },
      { stepNumber: 4, instruction: "Calculate the period (time/10)", expectedResult: "Period approximately 1.4 seconds", safetyNote: null },
      { stepNumber: 5, instruction: "Repeat with 25cm and 100cm lengths", expectedResult: "Shorter length = shorter period", safetyNote: null }
    ]
  },
  {
    title: "Refraction and Snell's Law",
    category: "physics" as const,
    difficulty: "advanced" as const,
    description: "Measure the refractive index of water using Snell's Law and observe light bending.",
    equipment: JSON.stringify(["Laser pointer", "Rectangular glass container", "Water", "Protractor", "White paper", "Ruler"]),
    safetyWarnings: JSON.stringify(["Never point laser at eyes", "Use low-power laser only", "Wear safety goggles"]),
    duration: 45,
    learningObjectives: JSON.stringify([
      "Observe light refraction",
      "Apply Snell's Law",
      "Calculate refractive index of water"
    ]),
    backgroundInfo: "Snell's Law describes how light bends when passing between media: n₁sin(θ₁) = n₂sin(θ₂). The refractive index of water is approximately 1.33.",
    steps: [
      { stepNumber: 1, instruction: "Fill container with water and place on white paper", expectedResult: "Clear water surface visible", safetyNote: "Wipe any spills immediately" },
      { stepNumber: 2, instruction: "Mark incident and refracted ray paths with protractor", expectedResult: "Clear angle measurements", safetyNote: "Keep laser stable" },
      { stepNumber: 3, instruction: "Shine laser at 30° angle into water", expectedResult: "Laser bends toward normal", safetyNote: "Never look directly at laser" },
      { stepNumber: 4, instruction: "Measure angle of refraction", expectedResult: "Angle approximately 22°", safetyNote: null },
      { stepNumber: 5, instruction: "Calculate refractive index using Snell's Law", expectedResult: "n ≈ 1.33", safetyNote: null },
      { stepNumber: 6, instruction: "Repeat at 45° and 60° incident angles", expectedResult: "Consistent refractive index", safetyNote: null }
    ]
  },

  // Chemistry Experiments (10)
  {
    title: "Acid-Base Indicator with Red Cabbage",
    category: "chemistry" as const,
    difficulty: "beginner" as const,
    description: "Create a natural pH indicator from red cabbage and test various household substances.",
    equipment: JSON.stringify(["Red cabbage", "Water", "Pot", "Strainer", "Clear cups", "Various household liquids (vinegar, baking soda solution, lemon juice, soap)"]),
    safetyWarnings: JSON.stringify(["Adult supervision required for boiling", "Do not taste any solutions", "Wash hands after handling chemicals"]),
    duration: 30,
    learningObjectives: JSON.stringify([
      "Understand pH and indicators",
      "Observe color changes in acids and bases",
      "Classify substances by pH"
    ]),
    backgroundInfo: "Red cabbage contains anthocyanin, a pigment that changes color depending on pH. Acids turn it pink/red, neutral is purple, and bases turn it green/yellow.",
    steps: [
      { stepNumber: 1, instruction: "Chop red cabbage and boil in water for 10 minutes", expectedResult: "Water turns deep purple", safetyNote: "Use oven mitts when handling hot pot" },
      { stepNumber: 2, instruction: "Strain the liquid and let it cool", expectedResult: "Clear purple indicator solution", safetyNote: "Allow sufficient cooling time" },
      { stepNumber: 3, instruction: "Pour indicator into 5 clear cups", expectedResult: "Equal amounts in each cup", safetyNote: null },
      { stepNumber: 4, instruction: "Add vinegar to cup 1", expectedResult: "Solution turns pink (acidic)", safetyNote: null },
      { stepNumber: 5, instruction: "Add baking soda solution to cup 2", expectedResult: "Solution turns blue-green (basic)", safetyNote: null },
      { stepNumber: 6, instruction: "Test lemon juice and soap in remaining cups", expectedResult: "Color indicates pH level", safetyNote: null }
    ]
  },
  {
    title: "Endothermic Reaction: Baking Soda and Vinegar",
    category: "chemistry" as const,
    difficulty: "beginner" as const,
    description: "Observe an endothermic reaction and measure temperature change while producing carbon dioxide gas.",
    equipment: JSON.stringify(["Baking soda", "Vinegar", "Thermometer", "Beaker or cup", "Spoon"]),
    safetyWarnings: JSON.stringify(["Reaction may overflow - use large container", "Wear safety goggles"]),
    duration: 20,
    learningObjectives: JSON.stringify([
      "Observe an endothermic reaction",
      "Measure temperature change",
      "Identify gas production"
    ]),
    backgroundInfo: "When baking soda (sodium bicarbonate) reacts with vinegar (acetic acid), it produces carbon dioxide gas, water, and sodium acetate. This reaction absorbs heat from surroundings.",
    steps: [
      { stepNumber: 1, instruction: "Measure initial temperature of vinegar", expectedResult: "Room temperature reading", safetyNote: null },
      { stepNumber: 2, instruction: "Add 2 tablespoons of baking soda to beaker", expectedResult: "White powder in beaker", safetyNote: null },
      { stepNumber: 3, instruction: "Pour 100ml vinegar over baking soda", expectedResult: "Vigorous fizzing and bubbling", safetyNote: "Pour slowly to prevent overflow" },
      { stepNumber: 4, instruction: "Measure temperature during reaction", expectedResult: "Temperature decreases", safetyNote: null },
      { stepNumber: 5, instruction: "Observe the gas production", expectedResult: "CO₂ bubbles form", safetyNote: null }
    ]
  },
  {
    title: "Titration: Determining Acid Concentration",
    category: "chemistry" as const,
    difficulty: "advanced" as const,
    description: "Perform an acid-base titration to determine the concentration of an unknown acid solution.",
    equipment: JSON.stringify(["Burette", "Pipette", "Conical flask", "0.1M NaOH solution", "Unknown HCl solution", "Phenolphthalein indicator", "White tile", "Clamp stand"]),
    safetyWarnings: JSON.stringify(["Wear safety goggles and gloves", "Handle acids and bases with care", "Clean up spills immediately"]),
    duration: 45,
    learningObjectives: JSON.stringify([
      "Perform accurate titration technique",
      "Calculate unknown concentration",
      "Understand equivalence point"
    ]),
    backgroundInfo: "Titration is a technique to determine the concentration of a solution by reacting it with a solution of known concentration. The equivalence point is reached when moles of acid equal moles of base.",
    steps: [
      { stepNumber: 1, instruction: "Rinse burette with NaOH solution", expectedResult: "Clean burette ready", safetyNote: "Dispose rinse solution properly" },
      { stepNumber: 2, instruction: "Fill burette with 0.1M NaOH to 0.00 mark", expectedResult: "No air bubbles in burette", safetyNote: "Check for leaks" },
      { stepNumber: 3, instruction: "Pipette 25.0ml of unknown HCl into flask", expectedResult: "Accurate volume transferred", safetyNote: "Use pipette filler" },
      { stepNumber: 4, instruction: "Add 2-3 drops of phenolphthalein indicator", expectedResult: "Solution remains colorless", safetyNote: null },
      { stepNumber: 5, instruction: "Titrate slowly, swirling constantly", expectedResult: "First permanent pink color", safetyNote: "Add dropwise near endpoint" },
      { stepNumber: 6, instruction: "Record burette reading at endpoint", expectedResult: "Accurate volume measurement", safetyNote: null },
      { stepNumber: 7, instruction: "Repeat titration for concordant results", expectedResult: "Results within 0.1ml", safetyNote: null },
      { stepNumber: 8, instruction: "Calculate HCl concentration using formula", expectedResult: "Concentration determined", safetyNote: null }
    ]
  },

  // Biology Experiments (10)
  {
    title: "Osmosis in Potato Cells",
    category: "biology" as const,
    difficulty: "beginner" as const,
    description: "Observe osmosis by placing potato strips in solutions of different concentrations.",
    equipment: JSON.stringify(["Potato", "Knife", "Ruler", "Salt", "Water", "3 cups", "Scale"]),
    safetyWarnings: JSON.stringify(["Use knife carefully", "Adult supervision for cutting"]),
    duration: 60,
    learningObjectives: JSON.stringify([
      "Understand osmosis",
      "Observe water movement across membranes",
      "Compare hypertonic, hypotonic, and isotonic solutions"
    ]),
    backgroundInfo: "Osmosis is the movement of water across a semi-permeable membrane from an area of low solute concentration to high solute concentration.",
    steps: [
      { stepNumber: 1, instruction: "Cut 3 identical potato strips (5cm x 1cm x 1cm)", expectedResult: "Uniform potato strips", safetyNote: "Cut away from body" },
      { stepNumber: 2, instruction: "Measure and record initial length and mass", expectedResult: "Baseline measurements recorded", safetyNote: null },
      { stepNumber: 3, instruction: "Prepare 3 solutions: pure water, 5% salt, 10% salt", expectedResult: "Three different concentrations", safetyNote: null },
      { stepNumber: 4, instruction: "Place one strip in each solution", expectedResult: "Strips fully submerged", safetyNote: null },
      { stepNumber: 5, instruction: "Wait 30 minutes", expectedResult: "Osmosis occurs", safetyNote: null },
      { stepNumber: 6, instruction: "Remove strips and measure final length and mass", expectedResult: "Water strip swells, salt strips shrink", safetyNote: null }
    ]
  },
  {
    title: "Photosynthesis: Oxygen Production in Elodea",
    category: "biology" as const,
    difficulty: "intermediate" as const,
    description: "Measure the rate of photosynthesis by counting oxygen bubbles produced by aquatic plants.",
    equipment: JSON.stringify(["Elodea plant", "Beaker", "Water", "Lamp", "Ruler", "Stopwatch", "Baking soda"]),
    safetyWarnings: JSON.stringify(["Keep electrical equipment away from water", "Do not overheat the water"]),
    duration: 40,
    learningObjectives: JSON.stringify([
      "Observe photosynthesis in action",
      "Measure oxygen production rate",
      "Understand factors affecting photosynthesis"
    ]),
    backgroundInfo: "Photosynthesis converts light energy into chemical energy, producing oxygen as a byproduct. The rate depends on light intensity, CO₂ concentration, and temperature.",
    steps: [
      { stepNumber: 1, instruction: "Fill beaker with water and add pinch of baking soda", expectedResult: "CO₂ source added", safetyNote: null },
      { stepNumber: 2, instruction: "Place Elodea sprig in water, cut end up", expectedResult: "Plant positioned for bubble collection", safetyNote: null },
      { stepNumber: 3, instruction: "Position lamp 10cm from beaker", expectedResult: "Plant illuminated", safetyNote: "Check lamp heat" },
      { stepNumber: 4, instruction: "Wait 5 minutes for equilibration", expectedResult: "Steady bubble production begins", safetyNote: null },
      { stepNumber: 5, instruction: "Count bubbles produced in 1 minute", expectedResult: "Measurable bubble rate", safetyNote: null },
      { stepNumber: 6, instruction: "Move lamp to 20cm and repeat count", expectedResult: "Fewer bubbles at greater distance", safetyNote: null },
      { stepNumber: 7, instruction: "Move lamp to 30cm and repeat count", expectedResult: "Further decrease in rate", safetyNote: null }
    ]
  },
  {
    title: "DNA Extraction from Strawberries",
    category: "biology" as const,
    difficulty: "intermediate" as const,
    description: "Extract visible DNA from strawberries using household materials.",
    equipment: JSON.stringify(["Strawberries", "Ziplock bag", "Dish soap", "Salt", "Water", "Coffee filter", "Rubbing alcohol (cold)", "Test tube or small glass"]),
    safetyWarnings: JSON.stringify(["Do not ingest extraction solution", "Keep alcohol away from flames"]),
    duration: 30,
    learningObjectives: JSON.stringify([
      "Understand DNA structure and location",
      "Extract DNA from plant cells",
      "Observe DNA precipitation"
    ]),
    backgroundInfo: "DNA is present in all living cells. Soap breaks down cell membranes, salt helps DNA precipitate, and alcohol causes DNA to separate from solution.",
    steps: [
      { stepNumber: 1, instruction: "Remove strawberry leaves and place 2 strawberries in bag", expectedResult: "Strawberries in sealed bag", safetyNote: null },
      { stepNumber: 2, instruction: "Mash strawberries thoroughly for 2 minutes", expectedResult: "Smooth strawberry pulp", safetyNote: null },
      { stepNumber: 3, instruction: "Mix 2 tsp dish soap, 1 tsp salt, 100ml water", expectedResult: "Extraction buffer prepared", safetyNote: null },
      { stepNumber: 4, instruction: "Add extraction buffer to bag and mix gently", expectedResult: "Cells break open", safetyNote: "Avoid creating bubbles" },
      { stepNumber: 5, instruction: "Filter mixture through coffee filter into glass", expectedResult: "Clear filtrate collected", safetyNote: null },
      { stepNumber: 6, instruction: "Slowly pour cold alcohol down side of glass", expectedResult: "Two distinct layers form", safetyNote: "Pour very slowly" },
      { stepNumber: 7, instruction: "Observe white stringy DNA at interface", expectedResult: "Visible DNA strands", safetyNote: null }
    ]
  },
  {
    title: "Enzyme Activity: Catalase and Hydrogen Peroxide",
    category: "biology" as const,
    difficulty: "advanced" as const,
    description: "Investigate how temperature affects enzyme activity using catalase from liver.",
    equipment: JSON.stringify(["Fresh liver", "3% hydrogen peroxide", "Test tubes", "Water bath", "Thermometer", "Ruler", "Knife", "Ice"]),
    safetyWarnings: JSON.stringify(["Handle hydrogen peroxide carefully", "Use knife safely", "Wear gloves when handling liver"]),
    duration: 50,
    learningObjectives: JSON.stringify([
      "Understand enzyme function",
      "Measure enzyme activity",
      "Analyze temperature effects on enzymes"
    ]),
    backgroundInfo: "Catalase is an enzyme that breaks down hydrogen peroxide into water and oxygen. Enzyme activity increases with temperature until denaturation occurs.",
    steps: [
      { stepNumber: 1, instruction: "Cut liver into 5 equal pieces (1cm cubes)", expectedResult: "Uniform liver samples", safetyNote: "Use clean knife and cutting board" },
      { stepNumber: 2, instruction: "Prepare water baths at 0°C, 20°C, 40°C, 60°C, 80°C", expectedResult: "Five temperature conditions", safetyNote: "Monitor temperatures carefully" },
      { stepNumber: 3, instruction: "Place one liver piece in each temperature for 5 min", expectedResult: "Samples equilibrated", safetyNote: null },
      { stepNumber: 4, instruction: "Add 5ml hydrogen peroxide to each test tube", expectedResult: "Tubes prepared", safetyNote: "Measure accurately" },
      { stepNumber: 5, instruction: "Add liver piece to tube and start timer", expectedResult: "Reaction begins", safetyNote: null },
      { stepNumber: 6, instruction: "Measure foam height after 1 minute", expectedResult: "Oxygen bubbles form foam", safetyNote: null },
      { stepNumber: 7, instruction: "Record foam height for each temperature", expectedResult: "Data collected", safetyNote: null },
      { stepNumber: 8, instruction: "Graph results: temperature vs. foam height", expectedResult: "Optimal temperature identified", safetyNote: null }
    ]
  }
];

async function seedExperiments() {
  console.log("🗑️  Clearing existing experiments...");
  await db.delete(experimentSteps);
  await db.delete(experiments);

  console.log("🧪 Seeding science experiments...");

  for (const expData of experimentsData) {
    const { steps, ...experimentInfo } = expData;

    // Insert experiment
    const [result] = await db.insert(experiments).values(experimentInfo).$returningId();
    const experimentId = result.id;

    // Insert steps
    for (const step of steps) {
      await db.insert(experimentSteps).values({
        experimentId: experimentId,
        stepNumber: step.stepNumber,
        instruction: step.instruction,
        expectedResult: step.expectedResult || null,
        safetyNote: step.safetyNote || null,
      });
    }
  }

  console.log("✅ Science experiments seeded successfully!");
  console.log(`Total experiments: ${experimentsData.length}`);
  console.log("Categories: Physics, Chemistry, Biology");
  process.exit(0);
}

seedExperiments().catch((error) => {
  console.error("Error seeding experiments:", error);
  process.exit(1);
});
