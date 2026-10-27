/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exportação estática: o build gera a pasta `out/`, que sobe direto na Hostinger.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
