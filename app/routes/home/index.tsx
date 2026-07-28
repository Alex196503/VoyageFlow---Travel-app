import type { Route } from "./+types"
import { getMeta } from "~/helpers/helpers"
export const meta = () => getMeta("Home")

export default function Home() {
  return <h3>Hello</h3>
}
