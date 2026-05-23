import type { NextConfig } from "next";
import Inspector from "../../packages/unplugin/src"

const nextConfig: NextConfig = {
    webpack(config) {
        config.plugins.push(
            Inspector.webpack(),
        )

        return config
    },
}

export default nextConfig;
