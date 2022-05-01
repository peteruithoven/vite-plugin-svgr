import fs from 'fs'
import type { Config } from '@svgr/core'
import { transformWithEsbuild } from 'vite'
import type { Plugin } from 'vite'

export interface ViteSvgrOptions {
  svgrOptions?: Config
  esbuildOptions?: Parameters<typeof transformWithEsbuild>[2]
}

export default function viteSvgr({
  svgrOptions,
  esbuildOptions,
}: ViteSvgrOptions = {}): Plugin {
  return {
    name: 'vite-plugin-svgr',
    async transform(code, id) {
      if (id.endsWith('.svg')) {
        const { transform } = await import('@svgr/core')
        const svgCode = await fs.promises.readFile(id, 'utf8')

        const componentCode = await transform(svgCode, svgrOptions, {
          filePath: id,
          caller: {
            previousExport: code,
          },
        })

        const res = await transformWithEsbuild(componentCode, id, {
          loader: 'jsx',
          ...esbuildOptions,
        })

        return {
          code: res.code,
          map: null, // TODO:
        }
      }
    },
  }
}
