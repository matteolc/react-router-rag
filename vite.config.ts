import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenvExpand from "dotenv-expand";

export default defineConfig(({ isSsrBuild, command, mode }) => {
	let define: Record<string, string> = {};
	if (mode === "development") {
		const env = loadEnv(mode, process.cwd(), "");
		dotenvExpand.expand({ parsed: env });
		define = {
			"process.env": JSON.stringify(env),
		};
	} else {
		define = {
			"process.env.BLOB_READ_WRITE_TOKEN": JSON.stringify(
				process.env.BLOB_READ_WRITE_TOKEN,
			),
			"process.env.SUPABASE_URL": JSON.stringify(process.env.SUPABASE_URL),
			"process.env.SUPABASE_ANON_KEY": JSON.stringify(
				process.env.SUPABASE_ANON_KEY,
			),
		};
	}

	return {
		define,
		ssr: {
			noExternal: command === "build" ? true : undefined,
		},
		plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
		server: {
			allowedHosts: true,
		},
	};
});
