import { GIFT_PACKAGES, EVENT_PACKAGES, BULK_TIERS, type GiftPackage, type EventPackage, type BulkTier } from "@/lib/catalog";

/** Which of the three existing customer paths the gift is for. */
export type WizardPath = "personal" | "event" | "bulk";

/** How memorable a personal gift should feel — maps 1:1 onto a named package. */
export type Mood = "simple" | "thoughtful" | "unforgettable";

export const MOOD_OPTIONS: Mood[] = ["simple", "thoughtful", "unforgettable"];
const MOOD_TO_PACKAGE_ID: Record<Mood, string> = {
  simple: "moment",
  thoughtful: "keepsake",
  unforgettable: "signature",
};

export interface WizardAnswers {
  path: WizardPath | null;
  mood: Mood | null; // personal
  eventPackageId: string | null; // event
  bulkTierIndex: number | null; // bulk
}

export const INITIAL_WIZARD_ANSWERS: WizardAnswers = {
  path: null,
  mood: null,
  eventPackageId: null,
  bulkTierIndex: null,
};

export type Recommendation =
  | { kind: "personal"; package: GiftPackage; ctaTo: string }
  | { kind: "event"; package: EventPackage; ctaTo: string }
  | { kind: "bulk"; tier: BulkTier; ctaTo: string };

/**
 * Deterministic match from answers to an actual catalog entry — no AI call, no
 * invented pricing. Every branch only ever points at a package/tier already
 * shown elsewhere on the site (`lib/catalog`), so a result can never promise
 * something checkout can't honour.
 */
export function recommend(answers: WizardAnswers): Recommendation | null {
  if (answers.path === "personal") {
    const pkg = GIFT_PACKAGES.find((p) => p.id === MOOD_TO_PACKAGE_ID[answers.mood ?? "thoughtful"]);
    return pkg ? { kind: "personal", package: pkg, ctaTo: `/customize?package=${pkg.id}` } : null;
  }
  if (answers.path === "event") {
    const pkg = EVENT_PACKAGES.find((p) => p.id === answers.eventPackageId) ?? null;
    return pkg ? { kind: "event", package: pkg, ctaTo: "/corporate#quote" } : null;
  }
  if (answers.path === "bulk") {
    const tier = answers.bulkTierIndex != null ? BULK_TIERS[answers.bulkTierIndex] : null;
    return tier ? { kind: "bulk", tier, ctaTo: "/corporate#quote" } : null;
  }
  return null;
}

/** Is the wizard ready to show a result for the current answers? */
export function isComplete(answers: WizardAnswers): boolean {
  if (answers.path === "personal") return answers.mood != null;
  if (answers.path === "event") return answers.eventPackageId != null;
  if (answers.path === "bulk") return answers.bulkTierIndex != null;
  return false;
}
