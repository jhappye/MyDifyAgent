import type { NextConfig } from 'next'
import process from 'node:process'
import withBundleAnalyzerInit from '@next/bundle-analyzer'
import createMDX from '@next/mdx'
import { codeInspectorPlugin } from 'code-inspector-plugin'

const isDev = process.env.NODE_ENV === 'development'
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
})
const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
})

// the default url to prevent parse url error when running jest
const hasSetWebPrefix = process.env.NEXT_PUBLIC_WEB_PREFIX
const port = process.env.PORT || 3000
const locImageURLs = !hasSetWebPrefix ? [new URL(`http://localhost:${port}/**`), new URL(`http://127.0.0.1:${port}/**`)] : []
const remoteImageURLs = ([hasSetWebPrefix ? new URL(`${process.env.NEXT_PUBLIC_WEB_PREFIX}/**`) : '', ...locImageURLs].filter(item => !!item)) as URL[]

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  serverExternalPackages: ['esbuild-wasm'],
  transpilePackages: ['echarts', 'zrender'],
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
    }),
  },
  productionBrowserSourceMaps: false, // enable browser source map generation during the production build
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    remotePatterns: remoteImageURLs.map(remoteImageURL => ({
      protocol: remoteImageURL.protocol.replace(':', '') as 'http' | 'https',
      hostname: remoteImageURL.hostname,
      port: remoteImageURL.port,
      pathname: remoteImageURL.pathname,
      search: '',
    })),
  },
  typescript: {
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BRAND_NAME: process.env.BRAND_NAME || '垣码平台',
    NEXT_PUBLIC_BRAND_LOGO_URL: process.env.BRAND_LOGO_URL || '/logo/logo.svg',
    NEXT_PUBLIC_BRAND_PRIMARY_COLOR: process.env.BRAND_PRIMARY_COLOR || '#1890ff',
    NEXT_PUBLIC_BRAND_FAVICON_URL: process.env.BRAND_FAVICON_URL || '/favicon.ico',
    NEXT_PUBLIC_COPYRIGHT_TEXT: process.env.COPYRIGHT_TEXT || 'Copyright © 2025 我方公司 版权所有',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/apps',
        permanent: false,
      },
    ]
  },
  // dev 时把 /console/api 和 /api 代理到 5001，/admin 代理到 8888
  ...(isDev && {
    async rewrites() {
      return [
        { source: '/console/api/:path*', destination: 'http://localhost:5001/console/api/:path*' },
        { source: '/api/:path*', destination: 'http://localhost:5001/api/:path*' },
        { source: '/admin', destination: 'http://localhost:8888/' },
        { source: '/admin/:path*', destination: 'http://localhost:8888/:path*' },
      ]
    },
  }),
  output: 'standalone',
  compiler: {
    removeConsole: isDev ? false : { exclude: ['warn', 'error'] },
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
}

export default withBundleAnalyzer(withMDX(nextConfig))
