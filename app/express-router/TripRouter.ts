import {
  type NextFunction,
  type Request,
  type Response
} from "express"
import { prisma } from "../../prisma/prisma"
import express from "express"
import { TripCategory } from "../../generated/prisma/enums"
import type { Prisma } from "../../generated/prisma/client"

export const TripRouter = express.Router()
TripRouter.get(
  "/",
  async (
    req: Request<
      {},
      {},
      {},
      {
        category?: string
        search?: string
        minPrice?: string
        maxPrice?: string
        page?: string
      }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = Number(req.query.page) || 1
      const limit = 3
      let categoryParam = req.query.category
      let searchParam = req.query.search
      const minPriceParam = req.query.minPrice
      const maxPriceParam = req.query.maxPrice

      const isValidCategory =
        categoryParam &&
        Object.values(TripCategory).includes(
          categoryParam as TripCategory
        )
      const whereClause: Prisma.TripWhereInput = {}
      if (isValidCategory) {
        whereClause.category =
          categoryParam.toUpperCase() as TripCategory
      }
      if (searchParam) {
        whereClause.country_code = {
          contains: searchParam.toLowerCase()
        }
      }
      if (minPriceParam || maxPriceParam) {
        const min = minPriceParam ? Number(minPriceParam) : NaN
        const max = maxPriceParam ? Number(maxPriceParam) : NaN
        const ABSOLUTE_MAX_PRICE = 100000
        whereClause.price = {}
        if (!isNaN(min) && min >= 0 && min <= ABSOLUTE_MAX_PRICE) {
          whereClause.price.gte = min
        }
        if (!isNaN(max) && max >= 0 && max <= ABSOLUTE_MAX_PRICE) {
          if (isNaN(min) || max >= min) {
            whereClause.price.lte = max
          }
        }
      }
      const trips = await prisma.trip.findMany({
        where: whereClause,
        include: {
          images: true
        },
        orderBy: {
          createdAt: "asc"
        },
        take: limit,
        skip: (page - 1) * limit
      })
      const formattedTrips = trips.map((trip) => ({
        ...trip,
        price: Number(trip.price)
      }))
      const total = await prisma.trip.count({ where: whereClause })
      return res.status(200).json({
        success: true,
        count: formattedTrips.length,
        totalPages: Math.ceil(total / limit),
        formattedTrips
      })
    } catch (err) {
      return next(err)
    }
  }
)
