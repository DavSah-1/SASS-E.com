import { getDb } from "../server/db";
import { factUpdateNotifications } from "../drizzle/schema";

async function createTestNotifications() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  // Create sample notifications with action buttons
  const testNotifications = [
    {
      userId: 1, // Admin user
      verifiedFactId: 1,
      oldVersion: JSON.stringify({ answer: "Old answer" }),
      newVersion: JSON.stringify({ answer: "New answer" }),
      notificationType: "fact_update",
      title: "Fact Update Available",
      message: "A fact you accessed has been updated with new information.",
      actionUrl: "/learn?factId=1",
      actionType: "view_details",
      actionLabel: "View Update",
      isRead: 0,
      isDismissed: 0,
    },
    {
      userId: 1,
      verifiedFactId: 2,
      oldVersion: JSON.stringify({ answer: "Old answer 2" }),
      newVersion: JSON.stringify({ answer: "New answer 2" }),
      notificationType: "fact_update",
      title: "2 New Fact Updates",
      message: "Multiple facts you accessed have been updated.",
      actionUrl: "/learn",
      actionType: "view_details",
      actionLabel: "View Updates",
      batchKey: `fact_update_${new Date().toISOString().split('T')[0]}-${new Date().getHours()}`,
      batchCount: 2,
      isRead: 0,
      isDismissed: 0,
    },
    {
      userId: 1,
      verifiedFactId: 3,
      oldVersion: JSON.stringify({ answer: "Old answer 3" }),
      newVersion: JSON.stringify({ answer: "New answer 3" }),
      notificationType: "learning_achievement",
      title: "Learning Milestone Reached!",
      message: "You've completed 10 lessons this week. Keep up the great work!",
      actionUrl: "/learn",
      actionType: "view_details",
      actionLabel: "Continue Learning",
      isRead: 0,
      isDismissed: 0,
    },
  ];

  try {
    await db.insert(factUpdateNotifications).values(testNotifications);
    console.log("✅ Created 3 test notifications successfully");
    console.log("- Fact Update (single)");
    console.log("- Fact Update (batched, 2 updates)");
    console.log("- Learning Achievement");
    console.log("\nYou can now click the notification bell to see the action buttons!");
  } catch (error) {
    console.error("Error creating test notifications:", error);
  }

  process.exit(0);
}

createTestNotifications();
