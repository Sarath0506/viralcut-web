import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const src = join(webRoot, "packages", "ui-tokens");
const dest = join(webRoot, "..", "viralcut-mobile", "packages", "ui-tokens");

mkdirSync(join(dest, "lib"), { recursive: true });
mkdirSync(join(dest, "dist"), { recursive: true });

cpSync(join(src, "lib", "viralcut_token_colors.dart"), join(dest, "lib", "viralcut_token_colors.dart"));
cpSync(join(src, "dist", "web.css"), join(dest, "dist", "web.css"));

console.log("Synced ui-tokens to viralcut-mobile/packages/ui-tokens");
