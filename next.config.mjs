/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exportação estática: o build gera a pasta `out/`, que sobe direto na Hostinger.
  output: 'export',
  // permite gerar o build sem mexer na pasta do servidor de desenvolvimento
  distDir: process.env.NEXT_DIST_DIR || '.next',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
