import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // 主进程入口
        entry: 'src/main/index.ts',
      },
      {
        // Preload 脚本
        entry: 'src/preload/index.ts',
        onstart(args) {
          args.reload()
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@main': path.resolve(__dirname, 'src/main'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})