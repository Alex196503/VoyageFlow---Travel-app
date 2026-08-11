import fs from "fs/promises"
import path from "node:path"
import type { RawCountry } from "~/types/types"
import {
  type Response,
  type Request,
  type NextFunction
} from "express"
import multer from "multer"
import { cloudinaryVar } from "../cloudinary-config"
import { CloudinaryStorage } from "multer-storage-cloudinary"

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

//Express middleware that returns 404 status if route introduced by the user is not found
export const routeNotFoundHandler = (req: Request, res: Response) => {
  return res
    .status(404)
    .json({ success: false, message: "Route not found!" })
}

//Express global middleware that catches any error that occured on the server
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack)
  return res.status(500).json({
    success: false,
    message: "Something bad happened with the server!",
    error: err.message || "Internal Server Error"
  })
}

export const uploadMiddleware = (folderName: string) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinaryVar,
    params: async (req: Request, file: Express.Multer.File) => {
      const publicId = `${file.fieldname}-${Date.now()}`
      return {
        public_id: publicId,
        folder: folderName.trim(),
        format: "webp"
      }
    }
  })
  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  })
}

