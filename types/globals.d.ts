export {};

declare global {
  interface UserPublicMetadata {
    role?: "therapist" | "client";
  }

  interface CustomJwtSessionClaims {
    metadata?: {
      role?: "therapist" | "client";
    };
  }
}
