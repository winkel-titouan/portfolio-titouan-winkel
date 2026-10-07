// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()],
    // Pré-optimise les librairies chargées en import dynamique : sinon Vite les découvre
    // au premier chargement en dev et la scène 3D échoue (erreur 504 "Outdated Optimize Dep").
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/loaders/GLTFLoader.js',
        'three/examples/jsm/environments/RoomEnvironment.js',
        'gsap',
        'gsap/ScrollTrigger',
        'lenis',
      ],
    },
  },
});
