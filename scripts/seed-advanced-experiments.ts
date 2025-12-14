import { drizzle } from "drizzle-orm/mysql2";
import { experiments, experimentSteps } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const advancedExperimentsData = [
  // Advanced Physics Experiments (7)
  {
    title: "Heat Engine Efficiency and Carnot Cycle",
    category: "physics" as const,
    difficulty: "advanced" as const,
    description: "Build a simple heat engine and measure its efficiency, comparing results to the theoretical Carnot efficiency limit.",
    equipment: JSON.stringify(["Stirling engine kit", "Thermometers (2)", "Heat source", "Ice bath", "Stopwatch", "Tachometer", "Insulated containers"]),
    safetyWarnings: JSON.stringify(["Hot surfaces - use heat-resistant gloves", "Keep flammable materials away from heat source", "Use caution with boiling water"]),
    duration: 60,
    learningObjectives: JSON.stringify([
      "Understand the Carnot cycle and thermodynamic efficiency",
      "Measure heat engine performance",
      "Calculate and compare theoretical vs actual efficiency"
    ]),
    backgroundInfo: "The Carnot cycle represents the maximum theoretical efficiency for a heat engine operating between two temperatures. Real engines always have lower efficiency due to friction, heat loss, and irreversible processes.",
    steps: [
      { stepNumber: 1, instruction: "Set up hot reservoir at 100°C (boiling water) and cold reservoir at 0°C (ice bath)", expectedResult: "Temperature difference of 100°C established", safetyNote: "Use insulated gloves when handling hot water" },
      { stepNumber: 2, instruction: "Measure and record initial temperatures of both reservoirs", expectedResult: "Accurate baseline temperatures recorded", safetyNote: null },
      { stepNumber: 3, instruction: "Place Stirling engine on hot reservoir and allow to equilibrate", expectedResult: "Engine reaches operating temperature", safetyNote: "Do not touch engine during operation" },
      { stepNumber: 4, instruction: "Start engine and measure rotation speed with tachometer", expectedResult: "Steady rotation achieved", safetyNote: null },
      { stepNumber: 5, instruction: "Record RPM over 5-minute intervals for 20 minutes", expectedResult: "Consistent performance data collected", safetyNote: null },
      { stepNumber: 6, instruction: "Calculate work output from RPM and engine specifications", expectedResult: "Work per cycle determined", safetyNote: null },
      { stepNumber: 7, instruction: "Calculate actual efficiency and compare to Carnot limit: η_Carnot = 1 - (T_cold/T_hot)", expectedResult: "Actual efficiency is 60-80% of Carnot efficiency", safetyNote: null },
      { stepNumber: 8, instruction: "Analyze sources of efficiency loss (friction, heat transfer, etc.)", expectedResult: "Understanding of real-world limitations", safetyNote: null }
    ]
  },
  {
    title: "Electromagnetic Induction and Faraday's Law",
    category: "physics" as const,
    difficulty: "advanced" as const,
    description: "Investigate electromagnetic induction by moving magnets through coils and measuring induced voltage and current.",
    equipment: JSON.stringify(["Solenoid coil (500 turns)", "Strong neodymium magnets", "Galvanometer or sensitive voltmeter", "Oscilloscope", "Connecting wires", "Ruler"]),
    safetyWarnings: JSON.stringify(["Strong magnets can pinch fingers", "Keep magnets away from electronic devices", "Be careful with wire connections"]),
    duration: 45,
    learningObjectives: JSON.stringify([
      "Demonstrate Faraday's Law of electromagnetic induction",
      "Measure induced EMF as a function of magnet speed",
      "Understand the relationship between flux change and induced voltage"
    ]),
    backgroundInfo: "Faraday's Law states that the induced EMF in a coil is proportional to the rate of change of magnetic flux: ε = -N(dΦ/dt), where N is the number of turns.",
    steps: [
      { stepNumber: 1, instruction: "Connect solenoid coil to galvanometer and verify zero reading", expectedResult: "No current flows initially", safetyNote: null },
      { stepNumber: 2, instruction: "Quickly insert magnet into coil (north pole first) and observe deflection", expectedResult: "Galvanometer shows positive deflection", safetyNote: "Keep fingers clear of coil opening" },
      { stepNumber: 3, instruction: "Quickly remove magnet and observe deflection direction", expectedResult: "Galvanometer shows negative deflection (opposite direction)", safetyNote: null },
      { stepNumber: 4, instruction: "Repeat with south pole first and compare results", expectedResult: "Deflection directions reverse", safetyNote: null },
      { stepNumber: 5, instruction: "Connect oscilloscope and drop magnet through coil from fixed height", expectedResult: "Voltage spike captured on oscilloscope", safetyNote: null },
      { stepNumber: 6, instruction: "Measure peak voltage for drops from 10cm, 20cm, 30cm heights", expectedResult: "Higher drop = higher induced voltage", safetyNote: null },
      { stepNumber: 7, instruction: "Calculate rate of flux change from magnet speed and coil area", expectedResult: "Verify Faraday's Law quantitatively", safetyNote: null }
    ]
  },
  {
    title: "Double-Slit Interference and Wave-Particle Duality",
    category: "physics" as const,
    difficulty: "advanced" as const,
    description: "Observe light interference patterns through double slits and measure wavelength of laser light.",
    equipment: JSON.stringify(["Red laser pointer (650nm)", "Double-slit apparatus (0.1mm spacing)", "White screen", "Meter stick", "Dark room", "Safety goggles"]),
    safetyWarnings: JSON.stringify(["Never look directly into laser beam", "Wear laser safety goggles", "Ensure no reflective surfaces in beam path"]),
    duration: 40,
    learningObjectives: JSON.stringify([
      "Observe wave interference patterns",
      "Calculate wavelength from interference data",
      "Understand wave-particle duality"
    ]),
    backgroundInfo: "Young's double-slit experiment demonstrates the wave nature of light. The spacing between bright fringes is given by: y = λL/d, where λ is wavelength, L is screen distance, and d is slit separation.",
    steps: [
      { stepNumber: 1, instruction: "Set up laser 2 meters from screen in darkened room", expectedResult: "Clear laser spot visible on screen", safetyNote: "Wear safety goggles throughout experiment" },
      { stepNumber: 2, instruction: "Place double-slit apparatus in beam path close to laser", expectedResult: "Two beams emerge from slits", safetyNote: "Never look into laser or slits" },
      { stepNumber: 3, instruction: "Observe interference pattern on screen", expectedResult: "Multiple bright and dark fringes visible", safetyNote: null },
      { stepNumber: 4, instruction: "Measure distance between 5 consecutive bright fringes", expectedResult: "Regular spacing observed", safetyNote: null },
      { stepNumber: 5, instruction: "Calculate average fringe spacing (y)", expectedResult: "Spacing approximately 13mm", safetyNote: null },
      { stepNumber: 6, instruction: "Measure distance L from slits to screen accurately", expectedResult: "Distance recorded", safetyNote: null },
      { stepNumber: 7, instruction: "Calculate wavelength using λ = yd/L with d = 0.1mm", expectedResult: "Wavelength ≈ 650nm (red light)", safetyNote: null }
    ]
  },
  {
    title: "Photoelectric Effect and Planck's Constant",
    category: "physics" as const,
    difficulty: "advanced" as const,
    description: "Demonstrate the photoelectric effect using different wavelengths of light and determine Planck's constant.",
    equipment: JSON.stringify(["Photoelectric effect apparatus", "Mercury vapor lamp with filters", "Voltmeter", "Ammeter", "Variable voltage source", "Color filters (UV, violet, blue, green)"]),
    safetyWarnings: JSON.stringify(["UV light can damage eyes - wear UV protection", "Mercury lamp gets very hot", "High voltage present - do not touch connections"]),
    duration: 50,
    learningObjectives: JSON.stringify([
      "Observe the photoelectric effect",
      "Measure stopping potential for different frequencies",
      "Calculate Planck's constant experimentally"
    ]),
    backgroundInfo: "Einstein's photoelectric equation: eV_s = hf - φ, where V_s is stopping potential, h is Planck's constant, f is frequency, and φ is work function.",
    steps: [
      { stepNumber: 1, instruction: "Set up photoelectric apparatus with zinc cathode", expectedResult: "Circuit connected properly", safetyNote: "Ensure all connections are secure" },
      { stepNumber: 2, instruction: "Turn on mercury lamp and allow to warm up for 5 minutes", expectedResult: "Lamp reaches full intensity", safetyNote: "Do not look directly at UV light" },
      { stepNumber: 3, instruction: "Illuminate cathode with UV filter and observe photocurrent", expectedResult: "Current flows (photoelectrons emitted)", safetyNote: "Wear UV protection goggles" },
      { stepNumber: 4, instruction: "Apply reverse voltage and increase until current reaches zero", expectedResult: "Stopping potential V_s measured", safetyNote: null },
      { stepNumber: 5, instruction: "Record stopping potential for UV light", expectedResult: "V_s approximately 1.5-2.0V", safetyNote: null },
      { stepNumber: 6, instruction: "Repeat measurements with violet, blue, and green filters", expectedResult: "Stopping potential decreases with wavelength", safetyNote: null },
      { stepNumber: 7, instruction: "Plot V_s vs frequency (f = c/λ)", expectedResult: "Linear relationship observed", safetyNote: null },
      { stepNumber: 8, instruction: "Calculate Planck's constant from slope: h = e × slope", expectedResult: "h ≈ 6.6 × 10^-34 J·s", safetyNote: null }
    ]
  },
  {
    title: "Doppler Effect in Sound Waves",
    category: "physics" as const,
    difficulty: "intermediate" as const,
    description: "Measure frequency shifts in sound waves from moving sources and verify the Doppler effect equation.",
    equipment: JSON.stringify(["Frequency generator", "Speaker", "Microphone", "Oscilloscope or frequency analyzer", "Moving platform or rotating arm", "Tachometer"]),
    safetyWarnings: JSON.stringify(["Keep clear of moving equipment", "Moderate sound levels to prevent hearing damage"]),
    duration: 45,
    learningObjectives: JSON.stringify([
      "Observe the Doppler effect in sound",
      "Measure frequency shifts for approaching and receding sources",
      "Verify Doppler equation: f' = f(v ± v_observer)/(v ± v_source)"
    ]),
    backgroundInfo: "The Doppler effect is the change in frequency of a wave for an observer moving relative to the source. For sound: f' = f(v + v_o)/(v - v_s), where v is sound speed.",
    steps: [
      { stepNumber: 1, instruction: "Set frequency generator to 1000 Hz and verify with stationary measurement", expectedResult: "Baseline frequency confirmed", safetyNote: null },
      { stepNumber: 2, instruction: "Mount speaker on rotating arm or moving cart", expectedResult: "Speaker secured safely", safetyNote: "Ensure speaker is firmly attached" },
      { stepNumber: 3, instruction: "Position microphone at fixed location in path of motion", expectedResult: "Microphone ready to capture sound", safetyNote: null },
      { stepNumber: 4, instruction: "Move speaker toward microphone at constant speed (2 m/s)", expectedResult: "Higher frequency detected", safetyNote: "Keep clear of moving equipment" },
      { stepNumber: 5, instruction: "Record maximum frequency as speaker approaches", expectedResult: "f' > 1000 Hz", safetyNote: null },
      { stepNumber: 6, instruction: "Record minimum frequency as speaker recedes", expectedResult: "f' < 1000 Hz", safetyNote: null },
      { stepNumber: 7, instruction: "Calculate expected frequencies using v_sound = 343 m/s", expectedResult: "Theoretical values match observations", safetyNote: null }
    ]
  },
  {
    title: "Moment of Inertia and Rotational Dynamics",
    category: "physics" as const,
    difficulty: "advanced" as const,
    description: "Measure moment of inertia for different shapes and verify the parallel axis theorem.",
    equipment: JSON.stringify(["Rotational dynamics apparatus", "Various objects (disk, ring, rod)", "Pulley system", "Masses", "Stopwatch", "Calipers", "Balance"]),
    safetyWarnings: JSON.stringify(["Secure all rotating objects", "Keep fingers away from moving parts", "Ensure masses are firmly attached"]),
    duration: 50,
    learningObjectives: JSON.stringify([
      "Measure moment of inertia experimentally",
      "Verify parallel axis theorem",
      "Understand rotational kinematics"
    ]),
    backgroundInfo: "Moment of inertia I = Σmr² depends on mass distribution. The parallel axis theorem states: I = I_cm + Md², where d is distance from center of mass.",
    steps: [
      { stepNumber: 1, instruction: "Measure mass and dimensions of disk", expectedResult: "Physical properties recorded", safetyNote: null },
      { stepNumber: 2, instruction: "Mount disk on rotational axis through center", expectedResult: "Disk rotates freely", safetyNote: "Ensure disk is balanced" },
      { stepNumber: 3, instruction: "Attach string to axis and hang 100g mass over pulley", expectedResult: "System ready for measurement", safetyNote: "Check that mass is secure" },
      { stepNumber: 4, instruction: "Release mass and measure time for 1 meter descent", expectedResult: "Acceleration data obtained", safetyNote: null },
      { stepNumber: 5, instruction: "Calculate angular acceleration from linear acceleration", expectedResult: "α = a/r determined", safetyNote: null },
      { stepNumber: 6, instruction: "Calculate experimental moment of inertia: I = (mgr - ma)r/α", expectedResult: "I_experimental obtained", safetyNote: null },
      { stepNumber: 7, instruction: "Compare to theoretical value: I_disk = (1/2)MR²", expectedResult: "Values agree within 10%", safetyNote: null },
      { stepNumber: 8, instruction: "Repeat with disk axis offset and verify parallel axis theorem", expectedResult: "I increases by Md²", safetyNote: null }
    ]
  },
  {
    title: "Blackbody Radiation and Stefan-Boltzmann Law",
    category: "physics" as const,
    difficulty: "advanced" as const,
    difficulty: "advanced" as const,
    description: "Measure thermal radiation from heated objects at different temperatures and verify the Stefan-Boltzmann law.",
    equipment: JSON.stringify(["Leslie cube (blackbody simulator)", "Infrared thermometer", "Thermal radiation sensor", "Hot plate", "Thermocouples", "Data logger"]),
    safetyWarnings: JSON.stringify(["Hot surfaces - use heat-resistant gloves", "Do not touch heated objects", "Allow adequate cooling time"]),
    duration: 55,
    learningObjectives: JSON.stringify([
      "Measure thermal radiation intensity",
      "Verify Stefan-Boltzmann law: P = σAT⁴",
      "Understand blackbody radiation"
    ]),
    backgroundInfo: "The Stefan-Boltzmann law states that power radiated by a blackbody is proportional to the fourth power of absolute temperature: P = σAT⁴, where σ = 5.67×10⁻⁸ W/(m²·K⁴).",
    steps: [
      { stepNumber: 1, instruction: "Fill Leslie cube with hot water at 50°C", expectedResult: "Cube at uniform temperature", safetyNote: "Use heat-resistant gloves" },
      { stepNumber: 2, instruction: "Position radiation sensor 10cm from black surface", expectedResult: "Sensor aligned properly", safetyNote: null },
      { stepNumber: 3, instruction: "Measure radiation intensity and record temperature", expectedResult: "Baseline data at 50°C", safetyNote: null },
      { stepNumber: 4, instruction: "Heat cube to 60°C, 70°C, 80°C, 90°C", expectedResult: "Temperature series obtained", safetyNote: "Monitor temperature carefully" },
      { stepNumber: 5, instruction: "Record radiation intensity at each temperature", expectedResult: "Intensity increases with temperature", safetyNote: null },
      { stepNumber: 6, instruction: "Convert temperatures to Kelvin (T_K = T_C + 273.15)", expectedResult: "Absolute temperatures calculated", safetyNote: null },
      { stepNumber: 7, instruction: "Plot radiation intensity vs T⁴", expectedResult: "Linear relationship observed", safetyNote: null },
      { stepNumber: 8, instruction: "Calculate Stefan-Boltzmann constant from slope", expectedResult: "σ ≈ 5.67×10⁻⁸ W/(m²·K⁴)", safetyNote: null }
    ]
  },

  // Advanced Chemistry Experiments (7)
  {
    title: "Organic Synthesis: Aspirin from Salicylic Acid",
    category: "chemistry" as const,
    difficulty: "advanced" as const,
    description: "Synthesize acetylsalicylic acid (aspirin) through esterification and purify the product by recrystallization.",
    equipment: JSON.stringify(["Salicylic acid", "Acetic anhydride", "Concentrated sulfuric acid (catalyst)", "Erlenmeyer flask", "Hot plate", "Ice bath", "Büchner funnel", "Filter paper", "Vacuum pump", "Melting point apparatus"]),
    safetyWarnings: JSON.stringify(["Wear safety goggles and gloves at all times", "Acetic anhydride is corrosive - use in fume hood", "Sulfuric acid is highly corrosive", "Hot solutions can cause burns"]),
    duration: 90,
    learningObjectives: JSON.stringify([
      "Perform organic esterification reaction",
      "Purify product by recrystallization",
      "Determine purity using melting point"
    ]),
    backgroundInfo: "Aspirin is synthesized by reacting salicylic acid with acetic anhydride in the presence of an acid catalyst. The acetyl group replaces the hydroxyl group on the benzene ring.",
    steps: [
      { stepNumber: 1, instruction: "Weigh 2.0g salicylic acid into dry Erlenmeyer flask", expectedResult: "Accurate mass recorded", safetyNote: "Work in fume hood" },
      { stepNumber: 2, instruction: "Add 5mL acetic anhydride and 5 drops concentrated H₂SO₄", expectedResult: "Reagents mixed", safetyNote: "Add acid dropwise with extreme caution" },
      { stepNumber: 3, instruction: "Heat flask in 50°C water bath for 15 minutes with swirling", expectedResult: "Reaction proceeds, solution becomes clear", safetyNote: "Use heat-resistant gloves" },
      { stepNumber: 4, instruction: "Add 20mL cold water slowly to hydrolyze excess anhydride", expectedResult: "White precipitate forms", safetyNote: "Add water slowly to control exothermic reaction" },
      { stepNumber: 5, instruction: "Cool flask in ice bath for 10 minutes", expectedResult: "Crystallization occurs", safetyNote: null },
      { stepNumber: 6, instruction: "Filter crystals using Büchner funnel under vacuum", expectedResult: "Crude aspirin collected", safetyNote: null },
      { stepNumber: 7, instruction: "Recrystallize from hot ethanol-water mixture", expectedResult: "Purified white crystals obtained", safetyNote: "Ethanol is flammable - no open flames" },
      { stepNumber: 8, instruction: "Dry crystals and measure melting point", expectedResult: "M.P. 135-136°C indicates pure aspirin", safetyNote: null }
    ]
  },
  {
    title: "Electrochemistry: Galvanic Cell and Nernst Equation",
    category: "chemistry" as const,
    difficulty: "advanced" as const,
    description: "Construct galvanic cells with different concentrations and verify the Nernst equation for cell potential.",
    equipment: JSON.stringify(["Copper and zinc electrodes", "1.0M and 0.1M CuSO₄ solutions", "1.0M ZnSO₄ solution", "Salt bridge (KNO₃)", "Voltmeter", "Beakers", "Connecting wires"]),
    safetyWarnings: JSON.stringify(["Copper sulfate is toxic - avoid skin contact", "Wear gloves and safety goggles", "Dispose of solutions properly"]),
    duration: 50,
    learningObjectives: JSON.stringify([
      "Construct and measure galvanic cells",
      "Understand the Nernst equation",
      "Relate concentration to cell potential"
    ]),
    backgroundInfo: "The Nernst equation relates cell potential to concentration: E = E° - (RT/nF)ln(Q), where E° is standard potential, R is gas constant, T is temperature, n is electrons transferred, F is Faraday constant, and Q is reaction quotient.",
    steps: [
      { stepNumber: 1, instruction: "Set up Zn|Zn²⁺(1.0M)||Cu²⁺(1.0M)|Cu cell with salt bridge", expectedResult: "Complete circuit established", safetyNote: "Wear gloves when handling solutions" },
      { stepNumber: 2, instruction: "Measure cell potential with voltmeter", expectedResult: "E_cell ≈ 1.10V", safetyNote: null },
      { stepNumber: 3, instruction: "Record this as E° (standard cell potential)", expectedResult: "Standard potential documented", safetyNote: null },
      { stepNumber: 4, instruction: "Replace 1.0M CuSO₄ with 0.1M CuSO₄", expectedResult: "Lower concentration cathode", safetyNote: null },
      { stepNumber: 5, instruction: "Measure new cell potential", expectedResult: "E_cell decreases to ≈ 1.07V", safetyNote: null },
      { stepNumber: 6, instruction: "Calculate expected potential using Nernst equation at 25°C", expectedResult: "E = E° - (0.0592/2)log([Zn²⁺]/[Cu²⁺])", safetyNote: null },
      { stepNumber: 7, instruction: "Compare experimental and theoretical values", expectedResult: "Agreement within 5%", safetyNote: null }
    ]
  },
  {
    title: "Chemical Kinetics: Iodine Clock Reaction",
    category: "chemistry" as const,
    difficulty: "intermediate" as const,
    description: "Investigate reaction rates and determine the rate law for the iodine clock reaction.",
    equipment: JSON.stringify(["Potassium iodate solution", "Sodium bisulfite solution", "Starch solution", "Sulfuric acid", "Stopwatch", "Beakers", "Graduated cylinders", "Thermometer"]),
    safetyWarnings: JSON.stringify(["Wear safety goggles", "Sulfuric acid is corrosive", "Work in well-ventilated area"]),
    duration: 45,
    learningObjectives: JSON.stringify([
      "Measure reaction rates",
      "Determine rate law and rate constant",
      "Understand factors affecting reaction rate"
    ]),
    backgroundInfo: "The iodine clock reaction produces iodine slowly until bisulfite is consumed, then suddenly turns blue with starch. By varying concentrations, we can determine the rate law: rate = k[IO₃⁻]^m[HSO₃⁻]^n.",
    steps: [
      { stepNumber: 1, instruction: "Prepare 50mL of 0.02M KIO₃, 50mL of 0.02M NaHSO₃, and starch indicator", expectedResult: "Solutions ready", safetyNote: null },
      { stepNumber: 2, instruction: "Mix equal volumes (25mL each) and start stopwatch", expectedResult: "Colorless solution initially", safetyNote: null },
      { stepNumber: 3, instruction: "Record time when blue color appears", expectedResult: "Reaction time measured (typically 30-60s)", safetyNote: null },
      { stepNumber: 4, instruction: "Repeat with 0.04M KIO₃ (double concentration)", expectedResult: "Reaction time decreases", safetyNote: null },
      { stepNumber: 5, instruction: "Repeat with 0.04M NaHSO₃ (double concentration)", expectedResult: "Reaction time changes differently", safetyNote: null },
      { stepNumber: 6, instruction: "Calculate rate = 1/time for each trial", expectedResult: "Rates determined", safetyNote: null },
      { stepNumber: 7, instruction: "Determine reaction orders m and n from concentration-rate relationships", expectedResult: "Rate law established", safetyNote: null }
    ]
  },
  {
    title: "Spectroscopy: Beer-Lambert Law and Concentration Determination",
    category: "chemistry" as const,
    difficulty: "advanced" as const,
    description: "Use UV-Vis spectroscopy to create a calibration curve and determine unknown concentrations using Beer-Lambert law.",
    equipment: JSON.stringify(["UV-Vis spectrophotometer", "Copper sulfate solutions (various concentrations)", "Cuvettes", "Pipettes", "Volumetric flasks", "Distilled water"]),
    safetyWarnings: JSON.stringify(["Wear gloves when handling solutions", "Clean cuvettes carefully to avoid scratches", "Dispose of copper solutions properly"]),
    duration: 50,
    learningObjectives: JSON.stringify([
      "Operate UV-Vis spectrophotometer",
      "Apply Beer-Lambert law: A = εbc",
      "Create calibration curve for quantitative analysis"
    ]),
    backgroundInfo: "The Beer-Lambert law relates absorbance to concentration: A = εbc, where ε is molar absorptivity, b is path length, and c is concentration. This allows quantitative analysis of solutions.",
    steps: [
      { stepNumber: 1, instruction: "Prepare standard CuSO₄ solutions: 0.01M, 0.02M, 0.04M, 0.06M, 0.08M", expectedResult: "Five calibration standards ready", safetyNote: "Use volumetric glassware for accuracy" },
      { stepNumber: 2, instruction: "Set spectrophotometer wavelength to 810nm (λ_max for Cu²⁺)", expectedResult: "Instrument configured", safetyNote: null },
      { stepNumber: 3, instruction: "Blank instrument with distilled water in cuvette", expectedResult: "Zero absorbance baseline", safetyNote: "Handle cuvettes by frosted sides only" },
      { stepNumber: 4, instruction: "Measure absorbance of each standard solution", expectedResult: "Absorbance increases with concentration", safetyNote: null },
      { stepNumber: 5, instruction: "Plot absorbance vs concentration", expectedResult: "Linear relationship (Beer's law obeyed)", safetyNote: null },
      { stepNumber: 6, instruction: "Calculate molar absorptivity ε from slope (path length = 1cm)", expectedResult: "ε ≈ 12 M⁻¹cm⁻¹", safetyNote: null },
      { stepNumber: 7, instruction: "Measure absorbance of unknown CuSO₄ solution", expectedResult: "Absorbance value obtained", safetyNote: null },
      { stepNumber: 8, instruction: "Determine unknown concentration from calibration curve", expectedResult: "Concentration calculated accurately", safetyNote: null }
    ]
  },
  {
    title: "Equilibrium: Le Chatelier's Principle with Cobalt Complex",
    category: "chemistry" as const,
    difficulty: "intermediate" as const,
    description: "Observe color changes in cobalt chloride equilibrium and verify Le Chatelier's principle by manipulating temperature and concentration.",
    equipment: JSON.stringify(["Cobalt(II) chloride hexahydrate", "Concentrated HCl", "Water", "Test tubes", "Hot water bath", "Ice bath", "Ethanol"]),
    safetyWarnings: JSON.stringify(["Cobalt compounds are toxic - wear gloves", "HCl is corrosive", "Work in fume hood", "Ethanol is flammable"]),
    duration: 40,
    learningObjectives: JSON.stringify([
      "Observe dynamic chemical equilibrium",
      "Apply Le Chatelier's principle",
      "Understand effect of temperature and concentration on equilibrium"
    ]),
    backgroundInfo: "The equilibrium [Co(H₂O)₆]²⁺ (pink) ⇌ [CoCl₄]²⁻ (blue) + 6H₂O is temperature and concentration dependent. Le Chatelier's principle predicts how equilibrium shifts when stressed.",
    steps: [
      { stepNumber: 1, instruction: "Dissolve 1g CoCl₂·6H₂O in 10mL water", expectedResult: "Pink solution forms [Co(H₂O)₆]²⁺", safetyNote: "Wear gloves" },
      { stepNumber: 2, instruction: "Add concentrated HCl dropwise until color changes", expectedResult: "Solution turns blue [CoCl₄]²⁻", safetyNote: "Work in fume hood" },
      { stepNumber: 3, instruction: "Add water dropwise", expectedResult: "Color shifts back to pink", safetyNote: null },
      { stepNumber: 4, instruction: "Divide solution into two test tubes", expectedResult: "Equal volumes in each tube", safetyNote: null },
      { stepNumber: 5, instruction: "Heat one tube in hot water bath (60°C)", expectedResult: "Color shifts toward blue (endothermic direction)", safetyNote: "Use test tube holder" },
      { stepNumber: 6, instruction: "Cool other tube in ice bath", expectedResult: "Color shifts toward pink (exothermic direction)", safetyNote: null },
      { stepNumber: 7, instruction: "Return both tubes to room temperature", expectedResult: "Colors revert to intermediate purple", safetyNote: null }
    ]
  },
  {
    title: "Redox Titration: Permanganate and Oxalic Acid",
    category: "chemistry" as const,
    difficulty: "advanced" as const,
    description: "Perform a redox titration to determine the concentration of oxalic acid using potassium permanganate as titrant.",
    equipment: JSON.stringify(["0.02M KMnO₄ solution", "Unknown oxalic acid solution", "Dilute H₂SO₄", "Burette", "Pipette", "Erlenmeyer flask", "Hot plate", "White tile"]),
    safetyWarnings: JSON.stringify(["Permanganate stains skin and clothing", "Sulfuric acid is corrosive", "Wear gloves and goggles", "Heat solutions carefully"]),
    duration: 50,
    learningObjectives: JSON.stringify([
      "Perform redox titration",
      "Balance redox equations",
      "Calculate unknown concentration from titration data"
    ]),
    backgroundInfo: "In acidic solution, permanganate (MnO₄⁻, purple) oxidizes oxalic acid (H₂C₂O₄) to CO₂, while being reduced to Mn²⁺ (colorless). The endpoint is indicated by persistent pink color.",
    steps: [
      { stepNumber: 1, instruction: "Pipette 25.0mL oxalic acid solution into Erlenmeyer flask", expectedResult: "Accurate volume transferred", safetyNote: "Use pipette bulb" },
      { stepNumber: 2, instruction: "Add 25mL dilute H₂SO₄ to acidify solution", expectedResult: "Acidic conditions established", safetyNote: "Add acid carefully" },
      { stepNumber: 3, instruction: "Heat solution to 60-70°C (do not boil)", expectedResult: "Warm solution ready for titration", safetyNote: "Use hot plate, not open flame" },
      { stepNumber: 4, instruction: "Fill burette with 0.02M KMnO₄ and record initial reading", expectedResult: "Burette ready", safetyNote: "Check for air bubbles" },
      { stepNumber: 5, instruction: "Titrate slowly, swirling constantly", expectedResult: "Purple color disappears initially", safetyNote: "First drops may take time to decolorize" },
      { stepNumber: 6, instruction: "Near endpoint, add dropwise until faint pink persists for 30 seconds", expectedResult: "Endpoint reached", safetyNote: null },
      { stepNumber: 7, instruction: "Record final burette reading and calculate volume used", expectedResult: "Titration volume determined", safetyNote: null },
      { stepNumber: 8, instruction: "Calculate oxalic acid concentration using stoichiometry (2MnO₄⁻ + 5H₂C₂O₄ + 6H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O)", expectedResult: "Concentration determined", safetyNote: null }
    ]
  },
  {
    title: "Chromatography: Separation of Plant Pigments",
    category: "chemistry" as const,
    difficulty: "intermediate" as const,
    description: "Use thin-layer chromatography (TLC) to separate and identify chlorophyll and carotenoid pigments from leaves.",
    equipment: JSON.stringify(["Fresh spinach leaves", "Mortar and pestle", "Acetone or ethanol", "TLC plates (silica gel)", "Developing chamber", "Petroleum ether/acetone solvent (9:1)", "Capillary tubes", "Ruler", "Pencil"]),
    safetyWarnings: JSON.stringify(["Work in fume hood - solvents are volatile", "Acetone is flammable", "Wear gloves and goggles", "No open flames"]),
    duration: 45,
    learningObjectives: JSON.stringify([
      "Perform thin-layer chromatography",
      "Calculate Rf values",
      "Understand polarity and separation principles"
    ]),
    backgroundInfo: "Chromatography separates compounds based on differential affinity for stationary and mobile phases. Rf = (distance traveled by compound)/(distance traveled by solvent front).",
    steps: [
      { stepNumber: 1, instruction: "Grind 5g spinach leaves with 10mL acetone in mortar", expectedResult: "Dark green extract obtained", safetyNote: "Work in fume hood" },
      { stepNumber: 2, instruction: "Filter extract to remove solid debris", expectedResult: "Clear pigment solution", safetyNote: null },
      { stepNumber: 3, instruction: "Draw pencil line 1cm from bottom of TLC plate", expectedResult: "Origin line marked", safetyNote: "Use pencil, not pen" },
      { stepNumber: 4, instruction: "Spot extract on origin line using capillary tube", expectedResult: "Small concentrated spot applied", safetyNote: "Let spot dry between applications" },
      { stepNumber: 5, instruction: "Place plate in developing chamber with solvent (level below origin line)", expectedResult: "Solvent begins to rise by capillary action", safetyNote: "Cover chamber to saturate with vapor" },
      { stepNumber: 6, instruction: "Remove plate when solvent front reaches 1cm from top", expectedResult: "Pigments separated into colored bands", safetyNote: null },
      { stepNumber: 7, instruction: "Mark solvent front immediately and let plate dry", expectedResult: "Visible bands: carotene (yellow-orange), xanthophylls (yellow), chlorophyll a (blue-green), chlorophyll b (yellow-green)", safetyNote: null },
      { stepNumber: 8, instruction: "Measure distances and calculate Rf values for each pigment", expectedResult: "Rf values identify pigments", safetyNote: null }
    ]
  },

  // Advanced Biology Experiments (6)
  {
    title: "DNA Gel Electrophoresis and Restriction Analysis",
    category: "biology" as const,
    difficulty: "advanced" as const,
    description: "Perform restriction enzyme digestion of DNA and separate fragments by agarose gel electrophoresis to create DNA fingerprints.",
    equipment: JSON.stringify(["Agarose powder", "TBE buffer", "DNA samples", "Restriction enzymes (EcoRI, BamHI)", "Microcentrifuge tubes", "Micropipettes", "Gel electrophoresis apparatus", "Power supply", "DNA stain (ethidium bromide or SYBR safe)", "UV transilluminator", "DNA ladder"]),
    safetyWarnings: JSON.stringify(["Wear gloves when handling DNA stain", "UV light can damage eyes - use protective shield", "Electrical hazard - do not touch electrodes during operation", "Dispose of biological waste properly"]),
    duration: 120,
    learningObjectives: JSON.stringify([
      "Perform restriction enzyme digestion",
      "Run agarose gel electrophoresis",
      "Analyze DNA fragment patterns"
    ]),
    backgroundInfo: "Restriction enzymes cut DNA at specific sequences. Gel electrophoresis separates DNA fragments by size - smaller fragments migrate faster through the gel matrix toward the positive electrode.",
    steps: [
      { stepNumber: 1, instruction: "Prepare 1% agarose gel by dissolving 1g agarose in 100mL TBE buffer", expectedResult: "Clear gel solution", safetyNote: "Heat carefully to avoid boiling over" },
      { stepNumber: 2, instruction: "Pour gel into casting tray with comb and let solidify (30 min)", expectedResult: "Solid gel with wells formed", safetyNote: null },
      { stepNumber: 3, instruction: "Set up restriction digests: mix 10μL DNA + 2μL enzyme + 2μL buffer", expectedResult: "Three tubes: uncut control, EcoRI digest, BamHI digest", safetyNote: "Keep enzymes on ice" },
      { stepNumber: 4, instruction: "Incubate digests at 37°C for 60 minutes", expectedResult: "DNA cut at recognition sites", safetyNote: null },
      { stepNumber: 5, instruction: "Add loading dye to samples (2μL per 10μL sample)", expectedResult: "Samples ready for loading", safetyNote: null },
      { stepNumber: 6, instruction: "Load samples and DNA ladder into gel wells", expectedResult: "All samples loaded without bubbles", safetyNote: "Use proper pipetting technique" },
      { stepNumber: 7, instruction: "Run gel at 100V for 45-60 minutes", expectedResult: "Dye front migrates 2/3 down gel", safetyNote: "Ensure electrodes are connected correctly (DNA migrates to positive)" },
      { stepNumber: 8, instruction: "Stain gel and visualize under UV light", expectedResult: "Distinct DNA bands visible, different patterns for each enzyme", safetyNote: "Wear UV protection" },
      { stepNumber: 9, instruction: "Photograph gel and measure fragment sizes using ladder", expectedResult: "DNA fingerprint documented", safetyNote: null }
    ]
  },
  {
    title: "Mendelian Genetics: Drosophila Cross and Chi-Square Analysis",
    category: "biology" as const,
    difficulty: "advanced" as const,
    description: "Perform genetic crosses with fruit flies and use chi-square test to verify Mendelian inheritance ratios.",
    equipment: JSON.stringify(["Drosophila cultures (wild-type and mutant)", "Vials", "Fly food medium", "Anesthesia (CO₂ or ice)", "Dissecting microscope", "Brushes", "Labels"]),
    safetyWarnings: JSON.stringify(["Handle flies gently to avoid killing them", "Do not inhale CO₂ anesthesia", "Dispose of cultures properly", "Wash hands after handling flies"]),
    duration: 180,
    learningObjectives: JSON.stringify([
      "Perform genetic crosses",
      "Count and classify phenotypes",
      "Apply chi-square statistical test"
    ]),
    backgroundInfo: "Mendelian genetics predicts offspring ratios. For a monohybrid cross (Aa × Aa), expect 3:1 ratio. Chi-square test determines if observed data fits expected ratios: χ² = Σ(O-E)²/E.",
    steps: [
      { stepNumber: 1, instruction: "Anesthetize virgin wild-type females and mutant males", expectedResult: "Flies immobilized for sorting", safetyNote: "Work quickly to minimize anesthesia exposure" },
      { stepNumber: 2, instruction: "Set up P cross: 5 virgin females × 5 males in vial with food", expectedResult: "Parental generation mating", safetyNote: "Ensure females are virgin (less than 8 hours old)" },
      { stepNumber: 3, instruction: "Remove parents after 7 days", expectedResult: "F1 generation developing", safetyNote: null },
      { stepNumber: 4, instruction: "Count and classify F1 flies when they emerge (day 10-14)", expectedResult: "All F1 show dominant phenotype (heterozygous)", safetyNote: null },
      { stepNumber: 5, instruction: "Set up F1 × F1 cross with virgin F1 flies", expectedResult: "F2 generation cross established", safetyNote: null },
      { stepNumber: 6, instruction: "Remove F1 parents after 7 days", expectedResult: "F2 generation developing", safetyNote: null },
      { stepNumber: 7, instruction: "Count F2 flies and classify by phenotype", expectedResult: "Approximately 3:1 ratio (dominant:recessive)", safetyNote: "Count at least 100 flies for statistical validity" },
      { stepNumber: 8, instruction: "Calculate chi-square: χ² = Σ(Observed - Expected)²/Expected", expectedResult: "χ² value obtained", safetyNote: null },
      { stepNumber: 9, instruction: "Compare χ² to critical value (df=1, p=0.05: χ²=3.84)", expectedResult: "If χ² < 3.84, data fits 3:1 ratio", safetyNote: null }
    ]
  },
  {
    title: "Cellular Respiration: Measuring Oxygen Consumption",
    category: "biology" as const,
    difficulty: "intermediate" as const,
    description: "Measure the rate of cellular respiration in germinating seeds using a respirometer and calculate respiratory quotient.",
    equipment: JSON.stringify(["Germinating pea seeds", "Dry pea seeds", "Glass beads", "Respirometer tubes", "KOH solution (to absorb CO₂)", "Cotton wool", "Colored water", "Ruler", "Water baths at different temperatures"]),
    safetyWarnings: JSON.stringify(["KOH is caustic - wear gloves and goggles", "Handle glass carefully", "Ensure water baths are stable"]),
    duration: 60,
    learningObjectives: JSON.stringify([
      "Measure oxygen consumption rate",
      "Understand cellular respiration",
      "Investigate effect of temperature on metabolic rate"
    ]),
    backgroundInfo: "Cellular respiration consumes O₂ and produces CO₂. By absorbing CO₂ with KOH, pressure changes in a closed system reflect O₂ consumption. Rate increases with temperature and metabolic activity.",
    steps: [
      { stepNumber: 1, instruction: "Set up three respirometers: germinating seeds, dry seeds, glass beads (control)", expectedResult: "Three experimental conditions", safetyNote: "Wear gloves when handling KOH" },
      { stepNumber: 2, instruction: "Place cotton wool with KOH solution at bottom of each tube", expectedResult: "CO₂ will be absorbed", safetyNote: "Do not let KOH contact seeds directly" },
      { stepNumber: 3, instruction: "Add equal volumes of seeds/beads to each tube", expectedResult: "Consistent volumes across tubes", safetyNote: null },
      { stepNumber: 4, instruction: "Insert stopper with capillary tube containing colored water droplet", expectedResult: "Sealed system with pressure indicator", safetyNote: "Ensure airtight seal" },
      { stepNumber: 5, instruction: "Equilibrate all tubes in 25°C water bath for 10 minutes", expectedResult: "Temperature stabilized", safetyNote: null },
      { stepNumber: 6, instruction: "Mark initial position of water droplet in each tube", expectedResult: "Baseline recorded", safetyNote: null },
      { stepNumber: 7, instruction: "Record droplet position every 5 minutes for 30 minutes", expectedResult: "Germinating seeds show greatest O₂ consumption (droplet moves most)", safetyNote: null },
      { stepNumber: 8, instruction: "Repeat experiment at 15°C and 35°C", expectedResult: "Respiration rate increases with temperature", safetyNote: null },
      { stepNumber: 9, instruction: "Calculate respiration rate (mm³ O₂/min) for each condition", expectedResult: "Quantitative comparison of metabolic rates", safetyNote: null }
    ]
  },
  {
    title: "Enzyme Kinetics: Michaelis-Menten and Lineweaver-Burk Analysis",
    category: "biology" as const,
    difficulty: "advanced" as const,
    description: "Determine Michaelis constant (Km) and maximum velocity (Vmax) for an enzyme using spectrophotometric assay and graphical analysis.",
    equipment: JSON.stringify(["Alkaline phosphatase enzyme", "p-Nitrophenyl phosphate substrate (various concentrations)", "Buffer solution (pH 9)", "Spectrophotometer", "Cuvettes", "Micropipettes", "Stopwatch", "Water bath (37°C)"]),
    safetyWarnings: JSON.stringify(["Wear gloves and goggles", "Handle enzyme solutions carefully", "Clean cuvettes properly"]),
    duration: 70,
    learningObjectives: JSON.stringify([
      "Measure enzyme reaction rates",
      "Determine Km and Vmax",
      "Apply Michaelis-Menten and Lineweaver-Burk equations"
    ]),
    backgroundInfo: "Michaelis-Menten equation: v = (Vmax[S])/(Km + [S]). Km is substrate concentration at half Vmax. Lineweaver-Burk plot (1/v vs 1/[S]) linearizes data for easier parameter determination.",
    steps: [
      { stepNumber: 1, instruction: "Prepare substrate solutions: 0.1, 0.2, 0.5, 1.0, 2.0, 5.0 mM", expectedResult: "Six substrate concentrations ready", safetyNote: null },
      { stepNumber: 2, instruction: "Set spectrophotometer to 405nm (λmax for p-nitrophenol product)", expectedResult: "Instrument configured", safetyNote: null },
      { stepNumber: 3, instruction: "For each substrate concentration, add 2.8mL buffer + 0.1mL substrate to cuvette", expectedResult: "Reaction mixture prepared", safetyNote: null },
      { stepNumber: 4, instruction: "Equilibrate cuvette at 37°C for 5 minutes", expectedResult: "Temperature stabilized", safetyNote: null },
      { stepNumber: 5, instruction: "Add 0.1mL enzyme solution and immediately start timing", expectedResult: "Reaction initiated", safetyNote: "Mix quickly but gently" },
      { stepNumber: 6, instruction: "Record absorbance at 30-second intervals for 5 minutes", expectedResult: "Linear increase in absorbance (product formation)", safetyNote: null },
      { stepNumber: 7, instruction: "Calculate initial velocity (v) from slope of absorbance vs time", expectedResult: "Reaction rate for each [S]", safetyNote: null },
      { stepNumber: 8, instruction: "Plot v vs [S] (Michaelis-Menten plot)", expectedResult: "Hyperbolic curve", safetyNote: null },
      { stepNumber: 9, instruction: "Plot 1/v vs 1/[S] (Lineweaver-Burk plot)", expectedResult: "Linear relationship", safetyNote: null },
      { stepNumber: 10, instruction: "Determine Vmax from y-intercept (1/Vmax) and Km from x-intercept (-1/Km)", expectedResult: "Kinetic parameters calculated", safetyNote: null }
    ]
  },
  {
    title: "PCR and Genetic Amplification",
    category: "biology" as const,
    difficulty: "advanced" as const,
    description: "Amplify a specific DNA sequence using polymerase chain reaction (PCR) and analyze products by gel electrophoresis.",
    equipment: JSON.stringify(["DNA template", "Forward and reverse primers", "Taq polymerase", "dNTPs", "PCR buffer", "Thermal cycler", "PCR tubes", "Micropipettes", "Gel electrophoresis apparatus", "Agarose", "DNA stain"]),
    safetyWarnings: JSON.stringify(["Wear gloves when handling DNA and reagents", "Avoid contamination - use sterile technique", "UV protection when viewing gels"]),
    duration: 150,
    learningObjectives: JSON.stringify([
      "Perform PCR amplification",
      "Understand PCR cycling parameters",
      "Analyze PCR products"
    ]),
    backgroundInfo: "PCR amplifies specific DNA sequences through repeated cycles of denaturation (95°C), annealing (50-65°C), and extension (72°C). Each cycle doubles the target DNA, resulting in exponential amplification.",
    steps: [
      { stepNumber: 1, instruction: "Prepare PCR master mix: 10μL buffer, 2μL dNTPs, 1μL each primer, 0.5μL Taq, 1μL template DNA, water to 50μL", expectedResult: "Complete reaction mixture", safetyNote: "Keep enzymes on ice" },
      { stepNumber: 2, instruction: "Transfer 50μL mix to PCR tube and cap tightly", expectedResult: "Sample ready for cycling", safetyNote: "Avoid bubbles" },
      { stepNumber: 3, instruction: "Program thermal cycler: Initial denaturation 95°C 3min", expectedResult: "DNA fully denatured", safetyNote: null },
      { stepNumber: 4, instruction: "Set 30 cycles: Denature 95°C 30s, Anneal 55°C 30s, Extend 72°C 1min", expectedResult: "Cycling parameters programmed", safetyNote: null },
      { stepNumber: 5, instruction: "Set final extension: 72°C 5min, then hold at 4°C", expectedResult: "Complete amplification protocol", safetyNote: null },
      { stepNumber: 6, instruction: "Start thermal cycler (total time ~2 hours)", expectedResult: "PCR amplification proceeds", safetyNote: null },
      { stepNumber: 7, instruction: "Prepare 1.5% agarose gel while PCR runs", expectedResult: "Gel ready for electrophoresis", safetyNote: null },
      { stepNumber: 8, instruction: "Load 10μL PCR product + loading dye into gel wells", expectedResult: "Samples loaded with DNA ladder", safetyNote: null },
      { stepNumber: 9, instruction: "Run gel at 100V for 45 minutes", expectedResult: "DNA fragments separated", safetyNote: null },
      { stepNumber: 10, instruction: "Visualize gel under UV light", expectedResult: "Bright band at expected size indicates successful amplification", safetyNote: "Wear UV protection" }
    ]
  },
  {
    title: "Plant Transpiration and Stomatal Function",
    category: "biology" as const,
    difficulty: "intermediate" as const,
    description: "Measure transpiration rates under different conditions and observe stomatal opening/closing mechanisms.",
    equipment: JSON.stringify(["Potted plants", "Plastic bags", "Balance", "Fan", "Light source", "Microscope", "Clear nail polish", "Tape", "Humidity meter"]),
    safetyWarnings: JSON.stringify(["Handle plants carefully", "Ensure electrical equipment is safe around water"]),
    duration: 90,
    learningObjectives: JSON.stringify([
      "Measure transpiration rate",
      "Understand factors affecting water loss",
      "Observe stomata under microscope"
    ]),
    backgroundInfo: "Transpiration is water loss through stomata. Rate depends on light, temperature, humidity, and air movement. Stomata open in light (photosynthesis needs CO₂) and close in darkness or drought stress.",
    steps: [
      { stepNumber: 1, instruction: "Water four identical plants thoroughly and let drain for 30 minutes", expectedResult: "Plants at field capacity", safetyNote: null },
      { stepNumber: 2, instruction: "Cover soil surface with plastic bag to prevent evaporation", expectedResult: "Only transpiration measured", safetyNote: "Seal bag around stem" },
      { stepNumber: 3, instruction: "Weigh each plant and record initial mass", expectedResult: "Baseline measurements", safetyNote: null },
      { stepNumber: 4, instruction: "Set up four conditions: Control, High light, Fan (wind), High humidity (bag over plant)", expectedResult: "Four experimental treatments", safetyNote: null },
      { stepNumber: 5, instruction: "Weigh plants every 30 minutes for 3 hours", expectedResult: "Mass decreases due to water loss", safetyNote: null },
      { stepNumber: 6, instruction: "Calculate transpiration rate (g water lost per hour)", expectedResult: "Light and wind increase transpiration; humidity decreases it", safetyNote: null },
      { stepNumber: 7, instruction: "Paint clear nail polish on leaf undersides (one from each condition)", expectedResult: "Stomatal impressions", safetyNote: "Allow to dry completely" },
      { stepNumber: 8, instruction: "Peel off nail polish with tape and mount on slide", expectedResult: "Stomatal imprint ready for viewing", safetyNote: null },
      { stepNumber: 9, instruction: "Observe stomata under microscope and count open vs closed", expectedResult: "More stomata open in light/low humidity conditions", safetyNote: null }
    ]
  }
];

async function seedAdvancedExperiments() {
  console.log("🧪 Seeding 20 advanced science experiments...");

  for (const expData of advancedExperimentsData) {
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

  console.log("✅ Advanced experiments seeded successfully!");
  console.log(`Total new experiments: ${advancedExperimentsData.length}`);
  console.log("Distribution: 7 Physics, 7 Chemistry, 6 Biology");
  console.log("Topics: Thermodynamics, Electromagnetism, Optics, Organic Chemistry, Electrochemistry, Genetics, Molecular Biology");
  process.exit(0);
}

seedAdvancedExperiments().catch((error) => {
  console.error("Error seeding advanced experiments:", error);
  process.exit(1);
});
