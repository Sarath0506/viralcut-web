import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(__dirname, "tokens.json"), "utf8"));

function cssVars(mode) {
  const lines = Object.entries(tokens.color).map(([key, value]) => {
    const hex = value[mode];
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    return `  --vc-${cssKey}: ${hex};`;
  });
  return lines.join("\n");
}

const webCss = `/* Generated from packages/ui-tokens/tokens.json — do not edit by hand */
:root {
${cssVars("light")}
}

.dark {
${cssVars("dark")}
}
`;

const outWeb = join(__dirname, "dist", "web.css");
mkdirSync(dirname(outWeb), { recursive: true });
writeFileSync(outWeb, webCss);

const colorKeys = Object.keys(tokens.color);

function toDartColor(hex) {
  return `Color(${hex.replace("#", "0xFF")})`;
}

const flutterColorFields = Object.entries(tokens.color)
  .map(([key, value]) => {
    const light = toDartColor(value.light);
    const dark = toDartColor(value.dark);
    return `  static const ${key}Light = ${light};\n  static const ${key}Dark = ${dark};`;
  })
  .join("\n");

const resolveCases = colorKeys
  .map(
    (key) =>
      `      '${key}' => brightness == Brightness.dark ? ${key}Dark : ${key}Light,`,
  )
  .join("\n");

const radiusFields = Object.entries(tokens.radius)
  .map(([key, value]) => `  static const ${key} = ${value}.0;`)
  .join("\n");

const flutterDart = `// Generated from packages/ui-tokens/tokens.json — do not edit by hand
import 'package:flutter/material.dart';

abstract final class ViralCutTokenColors {
${flutterColorFields}

  /// Resolves a token [name] for the given [brightness].
  static Color resolve(Brightness brightness, String name) {
    return switch (name) {
${resolveCases}
      _ => throw ArgumentError('Unknown color token: \$name'),
    };
  }

  static Color forBrightness(Brightness brightness, Color light, Color dark) =>
      brightness == Brightness.dark ? dark : light;
}

abstract final class ViralCutTokenRadius {
${radiusFields}
}

abstract final class ViralCutTokenFonts {
  static const sans = '${tokens.font.sans}';
  static const display = '${tokens.font.display}';
}
`;

const outFlutterLib = join(__dirname, "lib", "viralcut_token_colors.dart");
mkdirSync(dirname(outFlutterLib), { recursive: true });
writeFileSync(outFlutterLib, flutterDart);

console.log("Built ui-tokens:", outWeb, outFlutterLib);
