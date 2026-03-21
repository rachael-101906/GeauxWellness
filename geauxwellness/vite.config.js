import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const mapboxToken =
    env.MAPBOX_ACCESS_TOKEN ||
    env.MAP_BOX_GL_ACCESS_TOKEN ||
    env.VITE_MAPBOX_ACCESS_TOKEN ||
    ''

  return {
    plugins: [react()],
    define: {
      'process.env.MAPBOX_ACCESS_TOKEN': JSON.stringify(mapboxToken),
      'process.env.MAP_BOX_GL_ACCESS_TOKEN': JSON.stringify(mapboxToken),
    },
  }
})
