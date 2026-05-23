import type { NextConfig } from "next";
import Inspector from "react-inspector"

const nextConfig: NextConfig = {
    webpack(config) {
        config.plugins.push(
            Inspector.webpack(),
        )

        return config
    },
}

export default nextConfig;
