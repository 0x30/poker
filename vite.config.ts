import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  define: {
    __poker__app__version: new Date().getTime(),
  },
  plugins: [vue(), vueJsx()],
});
