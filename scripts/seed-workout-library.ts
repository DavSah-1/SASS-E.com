import { drizzle } from "drizzle-orm/mysql2";
import { workouts } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const workoutLibrary = [
  // YOGA WORKOUTS (6 workouts)
  {
    title: "Morning Sun Salutation Flow",
    description: "Start your day with this energizing yoga sequence. Perfect for beginners, this flow wakes up your body and mind with gentle stretches and breathing exercises.",
    type: "yoga" as const,
    difficulty: "beginner" as const,
    duration: 15,
    equipment: JSON.stringify(["yoga mat"]),
    focusArea: "full body",
    caloriesBurned: 50,
    instructions: JSON.stringify([
      "Begin in Mountain Pose, feet hip-width apart",
      "Inhale, raise arms overhead",
      "Exhale, fold forward into Forward Bend",
      "Inhale, lift halfway to Flat Back",
      "Exhale, step back to Plank Pose",
      "Lower to Chaturanga, then Upward Dog",
      "Exhale to Downward Dog, hold for 5 breaths",
      "Step forward and repeat sequence 5 times"
    ]),
  },
  {
    title: "Power Vinyasa Flow",
    description: "Dynamic yoga sequence that builds strength and flexibility. This intermediate flow challenges your balance and core stability while improving cardiovascular endurance.",
    type: "yoga" as const,
    difficulty: "intermediate" as const,
    duration: 45,
    equipment: JSON.stringify(["yoga mat", "yoga blocks"]),
    focusArea: "full body",
    caloriesBurned: 200,
    instructions: JSON.stringify([
      "Warm up with 5 Sun Salutations",
      "Warrior I to Warrior II sequence (both sides)",
      "Triangle Pose to Extended Side Angle",
      "Crow Pose (hold 5 breaths)",
      "Boat Pose core work (3 sets of 10 breaths)",
      "Pigeon Pose hip openers",
      "Shoulder stand and plow pose",
      "Final relaxation in Savasana"
    ]),
  },
  {
    title: "Restorative Evening Yoga",
    description: "Gentle, relaxing yoga practice to unwind after a long day. Uses props for support and focuses on deep stretching and stress relief.",
    type: "yoga" as const,
    difficulty: "beginner" as const,
    duration: 30,
    equipment: JSON.stringify(["yoga mat", "yoga blocks", "blanket", "bolster"]),
    focusArea: "flexibility",
    caloriesBurned: 40,
    instructions: JSON.stringify([
      "Child's Pose with bolster (5 minutes)",
      "Supported Bridge Pose with block (3 minutes)",
      "Reclined Butterfly with bolster (5 minutes)",
      "Legs-Up-The-Wall Pose (10 minutes)",
      "Supine Twist (both sides, 3 minutes each)",
      "Final Savasana with blanket (5 minutes)"
    ]),
  },
  {
    title: "Core Power Yoga",
    description: "Intense yoga practice focused on building core strength. Combines traditional poses with core-specific exercises for a challenging workout.",
    type: "yoga" as const,
    difficulty: "advanced" as const,
    duration: 40,
    equipment: JSON.stringify(["yoga mat"]),
    focusArea: "core",
    caloriesBurned: 220,
    instructions: JSON.stringify([
      "Plank variations (high plank, side plank, forearm plank)",
      "Boat Pose to Low Boat transitions (10 reps)",
      "Crow Pose to Chaturanga flow",
      "Dolphin Plank (hold 1 minute)",
      "Forearm Side Plank with leg lift",
      "Wheel Pose (3 times, 30 seconds each)",
      "Headstand practice (if comfortable)",
      "Cool down with seated twists"
    ]),
  },
  {
    title: "Hip Flexibility Flow",
    description: "Targeted yoga sequence for improving hip mobility and flexibility. Great for runners, cyclists, or anyone with tight hips.",
    type: "yoga" as const,
    difficulty: "intermediate" as const,
    duration: 25,
    equipment: JSON.stringify(["yoga mat", "yoga blocks"]),
    focusArea: "hips",
    caloriesBurned: 80,
    instructions: JSON.stringify([
      "Cat-Cow warm up (10 rounds)",
      "Low Lunge with quad stretch (both sides)",
      "Lizard Pose variations (both sides)",
      "Pigeon Pose (hold 3 minutes each side)",
      "Fire Log Pose (both sides)",
      "Happy Baby Pose (2 minutes)",
      "Reclined Figure-4 stretch",
      "Savasana"
    ]),
  },
  {
    title: "Balance & Stability Yoga",
    description: "Challenge your balance and improve stability with this focused yoga practice. Builds proprioception and core strength.",
    type: "yoga" as const,
    difficulty: "intermediate" as const,
    duration: 35,
    equipment: JSON.stringify(["yoga mat"]),
    focusArea: "balance",
    caloriesBurned: 120,
    instructions: JSON.stringify([
      "Tree Pose (both sides, 1 minute each)",
      "Warrior III to Standing Split flow",
      "Eagle Pose (both sides)",
      "Half Moon Pose with blocks",
      "Dancer's Pose (both sides)",
      "Crow Pose to Headstand transition",
      "Forearm balance practice",
      "Seated meditation (5 minutes)"
    ]),
  },

  // HIIT WORKOUTS (6 workouts)
  {
    title: "20-Minute Fat Burner HIIT",
    description: "High-intensity interval training designed to maximize calorie burn. No equipment needed, just your body weight and determination.",
    type: "hiit" as const,
    difficulty: "intermediate" as const,
    duration: 20,
    equipment: JSON.stringify(["none"]),
    focusArea: "full body",
    caloriesBurned: 250,
    instructions: JSON.stringify([
      "Warm up: Jumping jacks (2 minutes)",
      "Round 1: 40 seconds work, 20 seconds rest",
      "- Burpees",
      "- Mountain climbers",
      "- Jump squats",
      "- High knees",
      "Rest 1 minute, repeat 3 more rounds",
      "Cool down: Walking and stretching (3 minutes)"
    ]),
  },
  {
    title: "Tabata Cardio Blast",
    description: "Intense 4-minute Tabata intervals repeated 4 times. This workout pushes your cardiovascular limits with 20 seconds of all-out effort followed by 10 seconds of rest.",
    type: "hiit" as const,
    difficulty: "advanced" as const,
    duration: 25,
    equipment: JSON.stringify(["none"]),
    focusArea: "cardio",
    caloriesBurned: 300,
    instructions: JSON.stringify([
      "Warm up: Light jog in place (3 minutes)",
      "Tabata 1: Burpees (20s on, 10s off, 8 rounds)",
      "Rest 1 minute",
      "Tabata 2: Jump lunges (20s on, 10s off, 8 rounds)",
      "Rest 1 minute",
      "Tabata 3: Mountain climbers (20s on, 10s off, 8 rounds)",
      "Rest 1 minute",
      "Tabata 4: Plank jacks (20s on, 10s off, 8 rounds)",
      "Cool down: Walking and deep breathing (3 minutes)"
    ]),
  },
  {
    title: "Beginner HIIT Starter",
    description: "Introduction to HIIT training with modified exercises and longer rest periods. Build your fitness foundation safely and effectively.",
    type: "hiit" as const,
    difficulty: "beginner" as const,
    duration: 15,
    equipment: JSON.stringify(["none"]),
    focusArea: "full body",
    caloriesBurned: 120,
    instructions: JSON.stringify([
      "Warm up: March in place (2 minutes)",
      "30 seconds work, 30 seconds rest:",
      "- Step-back lunges",
      "- Modified push-ups (on knees)",
      "- Bodyweight squats",
      "- Standing oblique crunches",
      "- Marching high knees",
      "Repeat circuit 3 times",
      "Cool down: Gentle stretching (3 minutes)"
    ]),
  },
  {
    title: "Lower Body HIIT",
    description: "Explosive lower body workout targeting legs and glutes. Build power, strength, and endurance in your lower body.",
    type: "hiit" as const,
    difficulty: "intermediate" as const,
    duration: 30,
    equipment: JSON.stringify(["dumbbells"]),
    focusArea: "legs",
    caloriesBurned: 280,
    instructions: JSON.stringify([
      "Warm up: Leg swings and air squats (3 minutes)",
      "45 seconds work, 15 seconds rest:",
      "- Jump squats",
      "- Walking lunges with dumbbells",
      "- Single-leg deadlifts (alternating)",
      "- Box jumps or step-ups",
      "- Sumo squat pulses",
      "- Curtsy lunges",
      "Rest 1 minute, repeat 3 rounds",
      "Cool down: Foam rolling and stretching (5 minutes)"
    ]),
  },
  {
    title: "Core & Cardio HIIT",
    description: "Combine core strengthening with cardio intervals for a comprehensive workout. Sculpt your abs while burning calories.",
    type: "hiit" as const,
    difficulty: "intermediate" as const,
    duration: 25,
    equipment: JSON.stringify(["none"]),
    focusArea: "core",
    caloriesBurned: 240,
    instructions: JSON.stringify([
      "Warm up: Torso twists and cat-cow (2 minutes)",
      "40 seconds work, 20 seconds rest:",
      "- Plank to downward dog",
      "- Bicycle crunches",
      "- Burpees",
      "- Russian twists",
      "- Mountain climbers",
      "- V-ups",
      "- High knees",
      "Repeat circuit 3 times",
      "Cool down: Child's pose and stretching (3 minutes)"
    ]),
  },
  {
    title: "Upper Body HIIT",
    description: "Intense upper body workout with minimal equipment. Build strength and endurance in your arms, shoulders, chest, and back.",
    type: "hiit" as const,
    difficulty: "advanced" as const,
    duration: 28,
    equipment: JSON.stringify(["dumbbells", "resistance bands"]),
    focusArea: "upper body",
    caloriesBurned: 220,
    instructions: JSON.stringify([
      "Warm up: Arm circles and shoulder rolls (2 minutes)",
      "50 seconds work, 10 seconds rest:",
      "- Push-up variations (wide, diamond, decline)",
      "- Dumbbell shoulder press",
      "- Tricep dips",
      "- Bent-over rows with dumbbells",
      "- Resistance band pull-aparts",
      "- Plank shoulder taps",
      "Rest 1 minute, repeat 3 rounds",
      "Cool down: Upper body stretching (4 minutes)"
    ]),
  },

  // STRENGTH WORKOUTS (6 workouts)
  {
    title: "Full Body Strength Builder",
    description: "Comprehensive strength training workout hitting all major muscle groups. Perfect for building overall strength and muscle tone.",
    type: "strength" as const,
    difficulty: "intermediate" as const,
    duration: 45,
    equipment: JSON.stringify(["dumbbells", "resistance bands", "bench"]),
    focusArea: "full body",
    caloriesBurned: 280,
    instructions: JSON.stringify([
      "Warm up: Dynamic stretching (5 minutes)",
      "Squats: 3 sets of 12 reps",
      "Bench press or push-ups: 3 sets of 10 reps",
      "Bent-over rows: 3 sets of 12 reps",
      "Overhead press: 3 sets of 10 reps",
      "Deadlifts: 3 sets of 8 reps",
      "Plank: 3 sets of 60 seconds",
      "Cool down: Static stretching (5 minutes)"
    ]),
  },
  {
    title: "Leg Day Strength",
    description: "Intense lower body strength workout. Build powerful legs and glutes with compound and isolation exercises.",
    type: "strength" as const,
    difficulty: "advanced" as const,
    duration: 50,
    equipment: JSON.stringify(["barbell", "dumbbells", "leg press machine"]),
    focusArea: "legs",
    caloriesBurned: 320,
    instructions: JSON.stringify([
      "Warm up: Leg swings and light cardio (5 minutes)",
      "Back squats: 4 sets of 8 reps (heavy)",
      "Romanian deadlifts: 3 sets of 10 reps",
      "Leg press: 3 sets of 12 reps",
      "Walking lunges: 3 sets of 20 steps",
      "Leg curls: 3 sets of 12 reps",
      "Calf raises: 4 sets of 15 reps",
      "Cool down: Foam rolling and stretching (8 minutes)"
    ]),
  },
  {
    title: "Upper Body Power",
    description: "Build upper body strength and size with this comprehensive push/pull workout. Targets chest, back, shoulders, and arms.",
    type: "strength" as const,
    difficulty: "advanced" as const,
    duration: 55,
    equipment: JSON.stringify(["barbell", "dumbbells", "pull-up bar", "bench"]),
    focusArea: "upper body",
    caloriesBurned: 300,
    instructions: JSON.stringify([
      "Warm up: Arm circles and light cardio (5 minutes)",
      "Bench press: 4 sets of 6-8 reps",
      "Pull-ups or lat pulldowns: 4 sets of 8-10 reps",
      "Overhead press: 3 sets of 8 reps",
      "Barbell rows: 3 sets of 10 reps",
      "Dumbbell flyes: 3 sets of 12 reps",
      "Bicep curls: 3 sets of 12 reps",
      "Tricep extensions: 3 sets of 12 reps",
      "Cool down: Upper body stretching (5 minutes)"
    ]),
  },
  {
    title: "Beginner Strength Foundation",
    description: "Learn proper form and build a strength base with this beginner-friendly workout. Focus on mastering fundamental movements.",
    type: "strength" as const,
    difficulty: "beginner" as const,
    duration: 35,
    equipment: JSON.stringify(["dumbbells", "resistance bands"]),
    focusArea: "full body",
    caloriesBurned: 180,
    instructions: JSON.stringify([
      "Warm up: Light cardio and dynamic stretching (5 minutes)",
      "Goblet squats: 3 sets of 10 reps",
      "Dumbbell chest press: 3 sets of 10 reps",
      "Resistance band rows: 3 sets of 12 reps",
      "Dumbbell shoulder press: 3 sets of 8 reps",
      "Glute bridges: 3 sets of 15 reps",
      "Plank: 3 sets of 30 seconds",
      "Cool down: Full body stretching (5 minutes)"
    ]),
  },
  {
    title: "Core Strength Intensive",
    description: "Dedicated core workout to build a strong, stable midsection. Combines static holds with dynamic movements.",
    type: "strength" as const,
    difficulty: "intermediate" as const,
    duration: 30,
    equipment: JSON.stringify(["exercise ball", "ab wheel"]),
    focusArea: "core",
    caloriesBurned: 150,
    instructions: JSON.stringify([
      "Warm up: Cat-cow and torso rotations (3 minutes)",
      "Plank variations: 3 sets of 45 seconds each",
      "Dead bug: 3 sets of 12 reps per side",
      "Ab wheel rollouts: 3 sets of 10 reps",
      "Ball crunches: 3 sets of 15 reps",
      "Russian twists with weight: 3 sets of 20 reps",
      "Hanging leg raises: 3 sets of 10 reps",
      "Pallof press: 3 sets of 12 reps per side",
      "Cool down: Child's pose and stretching (3 minutes)"
    ]),
  },
  {
    title: "Functional Strength Training",
    description: "Real-world strength training focusing on movement patterns used in daily life. Improve overall functional fitness.",
    type: "strength" as const,
    difficulty: "intermediate" as const,
    duration: 40,
    equipment: JSON.stringify(["kettlebell", "medicine ball", "dumbbells"]),
    focusArea: "full body",
    caloriesBurned: 260,
    instructions: JSON.stringify([
      "Warm up: Movement prep and mobility (5 minutes)",
      "Kettlebell swings: 3 sets of 15 reps",
      "Turkish get-ups: 3 sets of 5 per side",
      "Medicine ball slams: 3 sets of 12 reps",
      "Farmer's walks: 3 sets of 40 meters",
      "Single-leg deadlifts: 3 sets of 10 per leg",
      "Rotational throws: 3 sets of 10 per side",
      "Cool down: Mobility work and stretching (5 minutes)"
    ]),
  },

  // PILATES WORKOUTS (4 workouts)
  {
    title: "Mat Pilates Fundamentals",
    description: "Classic Pilates mat work focusing on core strength, flexibility, and body awareness. Perfect for beginners to learn the basics.",
    type: "pilates" as const,
    difficulty: "beginner" as const,
    duration: 30,
    equipment: JSON.stringify(["yoga mat"]),
    focusArea: "core",
    caloriesBurned: 100,
    instructions: JSON.stringify([
      "Hundred: 100 arm pumps with legs tabletop",
      "Roll-up: 10 reps with control",
      "Single leg circles: 5 each direction per leg",
      "Rolling like a ball: 10 reps",
      "Single leg stretch: 10 reps per leg",
      "Double leg stretch: 10 reps",
      "Spine stretch forward: 5 reps",
      "Swan dive: 8 reps",
      "Side kicks series: 10 reps each exercise",
      "Seal: 10 reps"
    ]),
  },
  {
    title: "Reformer-Style Pilates",
    description: "Pilates workout inspired by reformer exercises, adapted for mat work with resistance bands. Builds long, lean muscles.",
    type: "pilates" as const,
    difficulty: "intermediate" as const,
    duration: 40,
    equipment: JSON.stringify(["yoga mat", "resistance bands", "pilates ring"]),
    focusArea: "full body",
    caloriesBurned: 180,
    instructions: JSON.stringify([
      "Footwork series with band: 20 reps each variation",
      "Leg circles with band: 10 each direction",
      "Chest expansion with ring: 12 reps",
      "Rowing series: 10 reps each variation",
      "Teaser prep and full teaser: 8 reps",
      "Side-lying leg work with band: 15 reps each",
      "Mermaid stretch: 5 reps per side",
      "Seal and roll-over: 10 reps"
    ]),
  },
  {
    title: "Power Pilates",
    description: "Advanced Pilates workout with challenging variations and faster pace. Builds serious core strength and control.",
    type: "pilates" as const,
    difficulty: "advanced" as const,
    duration: 45,
    equipment: JSON.stringify(["yoga mat", "pilates ring"]),
    focusArea: "core",
    caloriesBurned: 220,
    instructions: JSON.stringify([
      "Advanced hundred with straight legs",
      "Roll-over to jackknife: 8 reps",
      "Corkscrew: 5 each direction",
      "Teaser series (all variations): 10 reps",
      "Control balance: 10 reps",
      "Boomerang: 8 reps",
      "Crab: 8 reps",
      "Hip circles: 5 each direction",
      "Push-up to plank series: 10 reps",
      "Side bend: 5 per side"
    ]),
  },
  {
    title: "Pilates for Flexibility",
    description: "Gentle Pilates practice emphasizing stretching and lengthening. Improve flexibility while maintaining core engagement.",
    type: "pilates" as const,
    difficulty: "beginner" as const,
    duration: 35,
    equipment: JSON.stringify(["yoga mat", "foam roller"]),
    focusArea: "flexibility",
    caloriesBurned: 90,
    instructions: JSON.stringify([
      "Spine stretch forward: 8 reps",
      "Saw: 10 reps alternating",
      "Mermaid stretch: 8 per side",
      "Spine twist: 10 reps alternating",
      "Hip flexor stretch series",
      "Hamstring stretch with strap",
      "Figure-4 hip stretch",
      "Foam roller spine release",
      "Cat-cow on roller",
      "Final relaxation"
    ]),
  },

  // CARDIO WORKOUTS (4 workouts)
  {
    title: "Beginner Cardio Kickstart",
    description: "Low-impact cardio workout perfect for beginners or active recovery days. Build cardiovascular endurance gradually.",
    type: "cardio" as const,
    difficulty: "beginner" as const,
    duration: 20,
    equipment: JSON.stringify(["none"]),
    focusArea: "cardio",
    caloriesBurned: 140,
    instructions: JSON.stringify([
      "March in place: 3 minutes",
      "Step touches: 2 minutes",
      "Knee lifts: 2 minutes",
      "Grapevines: 2 minutes",
      "Heel digs: 2 minutes",
      "Arm circles while walking: 2 minutes",
      "Side steps: 2 minutes",
      "Cool down walk: 3 minutes",
      "Gentle stretching: 2 minutes"
    ]),
  },
  {
    title: "Jump Rope Cardio",
    description: "Classic jump rope workout with intervals and variations. Excellent for coordination, agility, and cardiovascular fitness.",
    type: "cardio" as const,
    difficulty: "intermediate" as const,
    duration: 25,
    equipment: JSON.stringify(["jump rope"]),
    focusArea: "cardio",
    caloriesBurned: 300,
    instructions: JSON.stringify([
      "Warm up: Light jumping (2 minutes)",
      "Basic jump: 1 minute",
      "Rest: 30 seconds",
      "Alternate foot step: 1 minute",
      "Rest: 30 seconds",
      "Double unders: 30 seconds",
      "Rest: 30 seconds",
      "High knees jump: 1 minute",
      "Rest: 30 seconds",
      "Repeat circuit 3 times",
      "Cool down: Walking and stretching (3 minutes)"
    ]),
  },
  {
    title: "Dance Cardio Party",
    description: "Fun, energetic dance-inspired cardio workout. No dance experience needed - just move to the beat and have fun!",
    type: "cardio" as const,
    difficulty: "intermediate" as const,
    duration: 30,
    equipment: JSON.stringify(["none"]),
    focusArea: "cardio",
    caloriesBurned: 250,
    instructions: JSON.stringify([
      "Warm up: Gentle movement and stretching (3 minutes)",
      "Salsa-inspired steps: 4 minutes",
      "Hip hop moves: 4 minutes",
      "Latin dance combinations: 4 minutes",
      "Freestyle dancing: 3 minutes",
      "Repeat entire sequence",
      "Cool down: Slow dancing and stretching (4 minutes)"
    ]),
  },
  {
    title: "Stair Climbing Cardio",
    description: "Intense cardio workout using stairs or step platform. Build lower body strength while getting your heart rate up.",
    type: "cardio" as const,
    difficulty: "advanced" as const,
    duration: 35,
    equipment: JSON.stringify(["stairs or step platform"]),
    focusArea: "legs",
    caloriesBurned: 350,
    instructions: JSON.stringify([
      "Warm up: Walking up and down slowly (3 minutes)",
      "Fast climb: 2 minutes",
      "Walk down: 1 minute",
      "Two steps at a time: 2 minutes",
      "Walk down: 1 minute",
      "Side step climbs: 2 minutes per side",
      "Walk down: 1 minute",
      "Sprint climbs: 30 seconds on, 30 seconds rest (10 rounds)",
      "Cool down: Slow walk and leg stretches (5 minutes)"
    ]),
  },

  // STRETCHING WORKOUTS (4 workouts)
  {
    title: "Full Body Flexibility Routine",
    description: "Comprehensive stretching routine for all major muscle groups. Improve flexibility and reduce muscle tension.",
    type: "stretching" as const,
    difficulty: "beginner" as const,
    duration: 20,
    equipment: JSON.stringify(["yoga mat", "yoga strap"]),
    focusArea: "flexibility",
    caloriesBurned: 40,
    instructions: JSON.stringify([
      "Neck rolls: 5 each direction",
      "Shoulder stretches: 30 seconds each",
      "Chest opener: 1 minute",
      "Tricep stretch: 30 seconds each arm",
      "Side bends: 30 seconds each side",
      "Seated forward fold: 2 minutes",
      "Butterfly stretch: 2 minutes",
      "Pigeon pose: 2 minutes each side",
      "Quad stretch: 1 minute each leg",
      "Calf stretch: 1 minute each leg",
      "Final relaxation: 2 minutes"
    ]),
  },
  {
    title: "Post-Workout Recovery Stretch",
    description: "Essential stretching routine to do after any workout. Promotes recovery and reduces muscle soreness.",
    type: "stretching" as const,
    difficulty: "beginner" as const,
    duration: 15,
    equipment: JSON.stringify(["yoga mat", "foam roller"]),
    focusArea: "flexibility",
    caloriesBurned: 30,
    instructions: JSON.stringify([
      "Foam roll quads: 1 minute",
      "Foam roll hamstrings: 1 minute",
      "Foam roll calves: 1 minute",
      "Foam roll IT band: 1 minute each side",
      "Standing quad stretch: 30 seconds each",
      "Standing hamstring stretch: 30 seconds each",
      "Hip flexor lunge stretch: 1 minute each",
      "Figure-4 glute stretch: 1 minute each",
      "Child's pose: 2 minutes",
      "Savasana: 2 minutes"
    ]),
  },
  {
    title: "Morning Mobility Flow",
    description: "Gentle morning routine to wake up your body and improve mobility. Perfect way to start your day feeling energized.",
    type: "stretching" as const,
    difficulty: "beginner" as const,
    duration: 10,
    equipment: JSON.stringify(["yoga mat"]),
    focusArea: "flexibility",
    caloriesBurned: 25,
    instructions: JSON.stringify([
      "Cat-cow: 10 rounds",
      "Thread the needle: 30 seconds each side",
      "Downward dog: 1 minute",
      "Low lunge with twist: 30 seconds each side",
      "Standing forward fold: 1 minute",
      "Shoulder rolls: 10 forward, 10 backward",
      "Hip circles: 10 each direction",
      "Ankle circles: 10 each direction",
      "Full body reach and yawn: 5 times"
    ]),
  },
  {
    title: "Deep Stretch for Athletes",
    description: "Intensive stretching session for serious athletes. Hold stretches longer to improve flexibility and prevent injury.",
    type: "stretching" as const,
    difficulty: "intermediate" as const,
    duration: 40,
    equipment: JSON.stringify(["yoga mat", "yoga blocks", "yoga strap"]),
    focusArea: "flexibility",
    caloriesBurned: 60,
    instructions: JSON.stringify([
      "Hamstring stretch with strap: 3 minutes each leg",
      "Hip flexor stretch: 3 minutes each side",
      "Pigeon pose: 4 minutes each side",
      "Seated spinal twist: 2 minutes each side",
      "Reclined figure-4: 3 minutes each side",
      "Lizard pose: 3 minutes each side",
      "Frog pose: 4 minutes",
      "Straddle forward fold: 4 minutes",
      "Shoulder stretch with strap: 2 minutes each",
      "Final relaxation: 5 minutes"
    ]),
  },
];

async function seedWorkoutLibrary() {
  try {
    console.log("🏋️ Seeding workout library...");
    
    // Insert all workouts
    for (const workout of workoutLibrary) {
      await db.insert(workouts).values(workout);
      console.log(`✅ Added: ${workout.title} (${workout.type}, ${workout.difficulty})`);
    }
    
    console.log(`\n🎉 Successfully seeded ${workoutLibrary.length} workouts!`);
    console.log("\nWorkout breakdown:");
    console.log(`- Yoga: 6 workouts`);
    console.log(`- HIIT: 6 workouts`);
    console.log(`- Strength: 6 workouts`);
    console.log(`- Pilates: 4 workouts`);
    console.log(`- Cardio: 4 workouts`);
    console.log(`- Stretching: 4 workouts`);
    console.log(`\nTotal: 30 guided workouts`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding workout library:", error);
    process.exit(1);
  }
}

seedWorkoutLibrary();
