import "dotenv/config"
import { cloudinaryVar } from "~/cloudinary-config"
import { prisma } from "../../prisma/prisma"

// Migration script to fetch all Unsplash images from the database, upload them to Cloudinary (into the "trips_img" folder), and update the database records with the new secure Cloudinary URLs.
//Run this script from the terminal using the npm command: npm run migrateImages
async function migrateImagesToCloudinary() {
  try {
    const images = await prisma.image.findMany()
    for (const img of images) {
      if (img.url.includes("unsplash.com")) {
        const uploadResponse = await cloudinaryVar.uploader.upload(
          img.url,
          {
            folder: "trips_img",
            use_filename: true,
            unique_filename: true
          }
        )
        await prisma.image.update({
          where: { id: img.id },
          data: { url: uploadResponse.secure_url }
        })
      }
    }
    console.log("Migration finished successfully!")
  } catch (err) {
    console.error("Migration error:", err)
  } finally {
    await prisma.$disconnect()
  }
}
migrateImagesToCloudinary()
