import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
  },
  base: "/chotty-tower-battle/",
  build: {
    target: "esnext",
  },
});
