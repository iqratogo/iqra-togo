import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Règles personnalisées
  {
    rules: {
      // Site en français — les apostrophes non-échappées sont intentionnelles
      "react/no-unescaped-entities": "off",
      // Faux positifs du React Compiler : window.location.href est intentionnel (rechargement complet post-auth)
      "react-hooks/immutability": "off",
      // Faux positifs : pattern useCallback+useEffect standard pour le data fetching
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
