import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { ReviewBookingRequestDto } from './dto/review-booking-request.dto';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Injectable()
export class PublicBookingService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Generates a booking reference like BK-20261012-0042 */
  private async generateBookingRef(): Promise<string> {
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const count = await this.prisma.publicBookingRequest.count({
      where: { createdAt: { gte: todayStart } },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `BK-${datePart}-${seq}`;
  }

  // ─── Public endpoint (no auth) ───────────────────────────────────────────────

  async createBookingRequest(dto: CreateBookingRequestDto) {
    const preferredDate = new Date(dto.preferredDate);
    if (isNaN(preferredDate.getTime())) {
      throw new BadRequestException('Invalid preferred date.');
    }

    // Do not allow booking in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (preferredDate < today) {
      throw new BadRequestException(
        'Preferred date cannot be in the past.',
      );
    }

    const bookingRef = await this.generateBookingRef();

    const booking = await this.prisma.publicBookingRequest.create({
      data: {
        bookingRef,
        patientName: dto.patientName,
        patientPhone: dto.patientPhone,
        patientEmail: dto.patientEmail ?? null,
        preferredDate,
        preferredTime: dto.preferredTime ?? null,
        visitReason: dto.visitReason ?? null,
        notes: dto.notes ?? null,
        facilityId: dto.facilityId ?? null,
        statusCode: 'PENDING',
      },
    });

    return {
      bookingRef: booking.bookingRef,
      patientName: booking.patientName,
      preferredDate: booking.preferredDate,
      statusCode: booking.statusCode,
      message:
        'Your booking request has been received. We will contact you to confirm.',
    };
  }

  // ─── Staff endpoints (JWT-protected) ────────────────────────────────────────

  async getPendingBookings(user: RequestUser) {
    const where: Record<string, unknown> = { statusCode: 'PENDING' };

    // Scope to the staff member's facility unless they are a super admin
    if (user.roleCode !== 'SUPER_ADMIN' && user.homeFacilityId) {
      where.facilityId = user.homeFacilityId;
    }

    const bookings = await this.prisma.publicBookingRequest.findMany({
      where,
      orderBy: [{ preferredDate: 'asc' }, { createdAt: 'asc' }],
      take: 100,
    });

    return bookings;
  }

  async getAllBookings(
    user: RequestUser,
    status?: string,
  ) {
    const where: Record<string, unknown> = {};

    if (status) where.statusCode = status;

    if (user.roleCode !== 'SUPER_ADMIN' && user.homeFacilityId) {
      where.facilityId = user.homeFacilityId;
    }

    return this.prisma.publicBookingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async reviewBooking(
    id: number,
    dto: ReviewBookingRequestDto,
    user: RequestUser,
  ) {
    const booking = await this.prisma.publicBookingRequest.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking request not found.');
    }

    if (booking.statusCode !== 'PENDING') {
      throw new BadRequestException(
        `Booking is already ${booking.statusCode.toLowerCase()} and cannot be reviewed again.`,
      );
    }

    const updated = await this.prisma.publicBookingRequest.update({
      where: { id },
      data: {
        statusCode: dto.action,
        staffNotes: dto.staffNotes ?? null,
        reviewedAt: new Date(),
        reviewedByUserId: user.userId,
      },
    });

    return updated;
  }
}
