import type { EndpointLocation, NotebookLmConfig } from "./types";

/** The single OAuth scope required to call Discovery Engine / NotebookLM. */
export const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

const VALID_ENDPOINT_LOCATIONS: readonly EndpointLocation[] = ["global", "us", "eu"];

/** Environment shape this integration reads from. */
export interface NotebookLmEnv {
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  GOOGLE_OAUTH_REDIRECT_URI?: string;
  NOTEBOOKLM_PROJECT_NUMBER?: string;
  NOTEBOOKLM_LOCATION?: string;
  NOTEBOOKLM_ENDPOINT_LOCATION?: string;
  NOTEBOOKLM_SCOPES?: string;
}

function require(env: NotebookLmEnv, key: keyof NotebookLmEnv): string {
  const value = env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[notebooklm] Missing required environment variable ${key}. ` +
        `See integrations/notebooklm/.env.example and README.md.`,
    );
  }
  return value.trim();
}

/**
 * Build a validated {@link NotebookLmConfig} from environment variables.
 * Throws a descriptive error if anything required is missing or invalid.
 *
 * Pass an explicit `env` to keep this pure/testable; defaults to process.env.
 */
export function loadNotebookLmConfig(
  env: NotebookLmEnv = process.env as NotebookLmEnv,
): NotebookLmConfig {
  const endpointLocationRaw = (env.NOTEBOOKLM_ENDPOINT_LOCATION ?? "global").trim();
  if (!VALID_ENDPOINT_LOCATIONS.includes(endpointLocationRaw as EndpointLocation)) {
    throw new Error(
      `[notebooklm] NOTEBOOKLM_ENDPOINT_LOCATION must be one of ` +
        `${VALID_ENDPOINT_LOCATIONS.join(", ")} (got "${endpointLocationRaw}").`,
    );
  }

  const scopes = (env.NOTEBOOKLM_SCOPES ?? CLOUD_PLATFORM_SCOPE)
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    clientId: require(env, "GOOGLE_OAUTH_CLIENT_ID"),
    clientSecret: require(env, "GOOGLE_OAUTH_CLIENT_SECRET"),
    redirectUri: require(env, "GOOGLE_OAUTH_REDIRECT_URI"),
    projectNumber: require(env, "NOTEBOOKLM_PROJECT_NUMBER"),
    location: (env.NOTEBOOKLM_LOCATION ?? "global").trim(),
    endpointLocation: endpointLocationRaw as EndpointLocation,
    scopes: scopes.length > 0 ? scopes : [CLOUD_PLATFORM_SCOPE],
  };
}
