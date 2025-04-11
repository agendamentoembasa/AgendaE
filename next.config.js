/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'static',
  transpilePackages: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'react-calendar'],
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig