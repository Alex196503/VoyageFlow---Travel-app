import fs from "fs/promises"
import path from "node:path"
import type { RawCountry } from "~/types/types"

//Handler that fetches and parses the raw countries dataset(SERVER-ONLY HANDLER). Isolated inside this node-utils file to make sure Node.js modules are never bundled into the client code.
const filePath = path.join(process.cwd(), "data.json")
export async function getCountriesRawData(): Promise<RawCountry[]> {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8")
    return JSON.parse(fileContent)
  } catch (error) {
    console.error("Failed to read countries data:", error)
    return []
  }
}
