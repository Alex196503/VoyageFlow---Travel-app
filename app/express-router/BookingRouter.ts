import {
  type NextFunction,
  type Request,
  type Response
} from "express"
import express from "express"
import { authentificationMiddleware } from "~/middleware/authMiddleware"
import type { Booking } from "../../generated/prisma/client"
import {
  BookingService,
  NodemailerService
} from "~/server/BookingService"
import { prisma } from "../../prisma/prisma"
import {
  BadRequestError,
  NotFoundError
} from "~/server/auth/custom-errors"
import { type UserBookingRow } from "~/types/types"

const nodemailerServiceHelper = new NodemailerService()
const bookingService = new BookingService(
  prisma,
  nodemailerServiceHelper
)

export const BookingRouter = express.Router()
BookingRouter.post(
  "/",
  authentificationMiddleware,
  async (
    req: Request<{}, {}, { trip_id: string; seats_booked: number }>,
    res: Response<{
      success: boolean
      message: string
      bookingCreated?: Booking
    }>,
    next: NextFunction
  ) => {
    try {
      let tripId = Number(req.body.trip_id)
      let seats_booked = req.body.seats_booked
      if (!tripId || isNaN(tripId) || tripId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid trip ID provided."
        })
      }
      if (
        !seats_booked ||
        isNaN(seats_booked) ||
        !Number.isInteger(seats_booked) ||
        seats_booked < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please specify a valid number of seats (at least 1)."
        })
      }
      const userId = req.user?.id as string
      const newBooking = await bookingService.performBooking(
        tripId.toString(),
        seats_booked,
        userId
      )
      return res.status(201).json({
        message: "Your booking was created!",
        success: true,
        bookingCreated: newBooking
      })
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: err.message
        })
      } else if (err instanceof BadRequestError) {
        return res.status(400).json({
          success: false,
          message: err.message
        })
      }
      return next(err)
    }
  }
)

BookingRouter.get(
  "/",
  authentificationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        })
      }
      const bookings = await bookingService.getBookingsByUserId(
        Number(userId)
      )
      return res.status(200).json({
        success: true,
        count: bookings.length,
        bookings
      })
    } catch (error) {
      return next(error)
    }
  }
)
