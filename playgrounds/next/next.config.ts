import type { NextConfig } from "next";
import Inspector from "interactive-react-inspector"

const nextConfig: NextConfig = {
    webpack(config) {
        config.plugins.push(
            Inspector.webpack(),
        )

        return config
    },
}

export default nextConfig;
