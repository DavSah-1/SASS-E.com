import { z } from "zod";
import bcrypt from "bcryptjs";
import { publicProcedure, router } from "./_core/trpc";

/**
 * Admin PIN Router
 * Provides secure PIN validation for admin access
 * 
 * Security: PIN is hashed using bcrypt and stored in environment variable
 * The hash should be generated using: bcrypt.hashSync("YOUR_10_DIGIT_PIN", 10)
 */

export const adminPinRouter = router({
  /**
   * Validate admin PIN
   * Returns success boolean without revealing any information about the PIN
   */
  validatePin: publicProcedure
    .input(
      z.object({
        pin: z.string().length(10, "PIN must be exactly 10 digits"),
      })
    )
    .mutation(async ({ input }) => {
      const { pin } = input;

      // Get hashed PIN from environment variable
      let hashedPin = process.env.ADMIN_PIN_HASH;

      if (!hashedPin) {
        console.error("[AdminPin] ADMIN_PIN_HASH not configured");
        // Return false without revealing that the hash is missing
        return { success: false };
      }

      // If hash is base64 encoded (doesn't start with $2), decode it first
      if (!hashedPin.startsWith('$2')) {
        try {
          hashedPin = Buffer.from(hashedPin, 'base64').toString('utf-8');
          console.log("[AdminPin] Decoded base64 hash");
        } catch (error) {
          console.error("[AdminPin] Base64 decode error:", error);
          return { success: false };
        }
      }

      try {
        // Compare provided PIN with hashed PIN
        const isValid = await bcrypt.compare(pin, hashedPin);

        if (isValid) {
          console.log("[AdminPin] Valid PIN provided");
        } else {
          console.log("[AdminPin] Invalid PIN attempt");
        }

        return { success: isValid };
      } catch (error) {
        console.error("[AdminPin] Validation error:", error);
        return { success: false };
      }
    }),

  /**
   * Generate PIN hash (for development/setup only)
   * This endpoint should be disabled in production or protected
   */
  generateHash: publicProcedure
    .input(
      z.object({
        pin: z.string().length(10, "PIN must be exactly 10 digits"),
      })
    )
    .mutation(async ({ input }) => {
      const { pin } = input;

      // Only allow in development
      if (process.env.NODE_ENV === "production") {
        throw new Error("Hash generation not available in production");
      }

      const hash = await bcrypt.hash(pin, 10);
      console.log("[AdminPin] Generated hash for PIN:", hash);

      return {
        hash,
        instruction: "Add this hash to your .env file as ADMIN_PIN_HASH",
      };
    }),
});
