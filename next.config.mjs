/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['web3.okx.com'],
  },
  // 启用 standalone 模式，减小 Docker 镜像大小
  output: 'standalone',
  // 实验性配置
  experimental: {
    // 优化服务器组件
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

export default nextConfig
