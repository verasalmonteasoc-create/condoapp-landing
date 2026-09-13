import nextPlugin from "eslint-config-next";

export default [
  ...nextPlugin,
  { ignores: ["out/**", ".next/**"] },
];
