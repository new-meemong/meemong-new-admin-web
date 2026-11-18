/** Detail targets shared by member profiles and moderation investigations. */
export type ContentDetailTarget =
  | { kind: "model-treatment" | "time-sale"; id: number }
  | { kind: "consultation"; id: number; answerId?: number }
  | { kind: "thunder-announcement"; id: number; userId: number };
