import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PublicBookingService } from './public-booking.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { ReviewBookingRequestDto } from './dto/review-booking-request.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('public-booking')
export class PublicBookingController {
  constructor(private readonly service: PublicBookingService) {}

  // ─── Public — no auth ───────────────────────────────────────────────────────

  /**
   * POST /public-booking
   * Patients submit this without logging in.
   */
  @Post()
  submitBooking(@Body() dto: CreateBookingRequestDto) {
    return this.service.createBookingRequest(dto);
  }

  // ─── Staff — JWT required ───────────────────────────────────────────────────

  /**
   * GET /public-booking/pending
   * Returns only PENDING requests for the staff member's facility.
   */
  @Get('pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    'SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN', 'BRANCH_ADMIN',
    'DOCTOR', 'CLINICIAN', 'NURSE', 'TRIAGE_NURSE',
  )
  getPending(@CurrentUser() user: RequestUser) {
    return this.service.getPendingBookings(user);
  }

  /**
   * GET /public-booking?status=PENDING
   * Full list with optional status filter.
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN', 'BRANCH_ADMIN')
  getAll(
    @CurrentUser() user: RequestUser,
    @Query('status') status?: string,
  ) {
    return this.service.getAllBookings(user, status);
  }

  /**
   * PATCH /public-booking/:id/review
   * Staff confirm or reject a booking request.
   */
  @Patch(':id/review')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    'SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN', 'BRANCH_ADMIN',
    'DOCTOR', 'CLINICIAN', 'NURSE', 'TRIAGE_NURSE',
  )
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewBookingRequestDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.service.reviewBooking(id, dto, user);
  }
}
