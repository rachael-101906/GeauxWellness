import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = fileURLToPath(new URL('..', import.meta.url))
  const env = loadEnv(mode, envDir, '')
  const mapboxToken =
    env.MAPBOX_ACCESS_TOKEN ||
    env.MAP_BOX_GL_ACCESS_TOKEN ||
    env.VITE_MAPBOX_TOKEN ||
    env.VITE_MAPBOX_ACCESS_TOKEN ||
    ''

  return {
    plugins: [react()],
    envDir,
    define: {
      'process.env.MAPBOX_ACCESS_TOKEN': JSON.stringify(mapboxToken),
      'process.env.MAP_BOX_GL_ACCESS_TOKEN': JSON.stringify(mapboxToken),
    },
  }
})
