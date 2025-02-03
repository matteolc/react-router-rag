import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("./routes/app/layout.tsx", [
    index("./routes/app/home.tsx"),
    route("account", "./routes/app/account.tsx"),
    route("uploads", "./routes/app/uploads.tsx"),
  ]),
  layout("./routes/public/layout.tsx", [
    route("login", "./routes/public/login.tsx"),
    route("login-with-magic-link", "./routes/public/login-with-magic-link.tsx"),
    route("signup", "./routes/public/signup.tsx"),
  ]),
  route("api/switch-theme", "./routes/api/switch-theme.ts"),
  route("api/switch-workspace", "./routes/api/switch-workspace.ts"),
  route("api/logout", "./routes/api/logout.ts"),
  route("api/login-with-otp", "./routes/api/login-with-otp.ts"),
  route("api/onboard", "./routes/api/onboard.ts"),
  route("api/upload.($type)", "./routes/api/upload.($type).ts"),
] satisfies RouteConfig;
