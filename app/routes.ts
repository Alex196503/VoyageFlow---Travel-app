import {
  type RouteConfig,
  index,
  route
} from "@react-router/dev/routes"

export default [
  index("routes/home/index.tsx"),
  route("api", "routes/api/index.tsx"),
  route("api/:code", "routes/api-detail-page/index.tsx"),
  route("*", "routes/not-found-page/index.tsx")
] satisfies RouteConfig
