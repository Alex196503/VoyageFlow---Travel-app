import {
  type RouteConfig,
  index,
  route
} from "@react-router/dev/routes"

export default [
  index("routes/home/index.tsx"),
  route("countries", "routes/api/index.tsx"),
  route("country/:code", "routes/api-detail-page/index.tsx"),
  route("register", "routes/register/index.tsx"),
  route("login", "routes/login/index.tsx"),
  route("/verify-email", "routes/verify-email/index.tsx"),
  route("*", "routes/not-found-page/index.tsx")
] satisfies RouteConfig
