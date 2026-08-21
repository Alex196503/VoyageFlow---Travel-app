import sendEmailNotification from "~/nodemailer-config"
import { type PrismaClient } from "../../generated/prisma/client"
import { BadRequestError, NotFoundError } from "./auth/custom-errors"
import { type UserBookingRow } from "~/types/types"

abstract class IEmailService {
  abstract sendEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<void>
}

export class NodemailerService extends IEmailService {
  async sendEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<void> {
    await sendEmailNotification(to, subject, body)
  }
}

export class BookingService {
  private prisma: PrismaClient
  private emailService: IEmailService
  constructor(prisma: PrismaClient, emailService: IEmailService) {
    this.prisma = prisma
    this.emailService = emailService
  }

  async getBookingsByUserId(userId: number) {
    const bookings = await this.prisma.$queryRaw<
      UserBookingRow[]
    >`SELECT 
            b.id AS booking_id,
            b.seats_booked,
            b.total_price,
            b.status,
            b.createdAt,
            t.id AS trip_id,
            t.title AS trip_title,
            t.price AS trip_price,
            i.url AS cover_image_url
          FROM bookings b 
          JOIN trips t ON b.trip_id = t.id 
          LEFT JOIN images i ON t.id = i.trip_id AND i.is_cover = true
          WHERE b.user_id = ${Number(userId)}
          ORDER BY b.createdAt DESC;
      `
    return bookings
  }

  async performBooking(
    trip_id: string,
    seats_booked: number,
    user_id: string
  ) {
    let tripFound = await this.prisma.trip.findFirst({
      where: { id: Number(trip_id) }
    })
    if (!tripFound) {
      throw new NotFoundError("Trip not found!")
    }
    if (tripFound.available_seats < seats_booked) {
      throw new BadRequestError(
        `Not enough seats left. Only ${tripFound.available_seats} available.`
      )
    }
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        user_id: Number(user_id),
        trip_id: Number(trip_id),
        status: { not: "CANCELLED" }
      }
    })
    if (existingBooking) {
      throw new BadRequestError(
        "You already have a booking for this trip!"
      )
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.updateMany({
        where: {
          id: Number(trip_id),
          available_seats: { gte: seats_booked }
        },
        data: {
          available_seats: { decrement: seats_booked }
        }
      })
      if (updatedTrip.count === 0) {
        throw new Error("Not enough seats available.")
      }
      const newBooking = await tx.booking.create({
        data: {
          user_id: Number(user_id),
          trip_id: Number(trip_id),
          seats_booked: seats_booked,
          total_price: Number(tripFound.price) * seats_booked,
          status: "PENDING"
        },
        include: {
          user: {
            select: { email: true, name: true }
          }
        }
      })
      return newBooking
    })

    setImmediate(async () => {
      try {
        if (result.user?.email) {
          const paymentLink = `http://localhost:3000/checkout/${result.id}`
          const emailSubject =
            "Booking Confirmation - VoyageFlow (Payment coming soon)"
          const emailBody = `
            Hello ${result.user.name || "Traveler"},
            Your trip booking has been successfully registered!
            Booking details:
            - Seats booked: ${result.seats_booked}
            - Total amount: ${result.total_price} €
            - Status: ${result.status}
            
            To complete your reservation, use the payment link below:
            ${paymentLink}
            
            Thank you for choosing VoyageFlow!
          `
          await this.emailService.sendEmail(
            result.user.email,
            emailSubject,
            emailBody
          )
        }
      } catch (error) {
        console.error(
          "Error while sending the email in background",
          error
        )
      }
    })
    return result
  }
}
