import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

function trim(v: unknown) {
  return typeof v === 'string' ? v.trim() : v;
}

export class CreateBookingRequestDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  patientName: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(30)
  patientPhone: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  patientEmail?: string;

  /** ISO date string — date part only, e.g. "2026-10-20" */
  @IsDateString()
  preferredDate: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(20)
  preferredTime?: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  visitReason?: string;

  @Transform(({ value }) => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** Optional: pre-scope to a facility (set via query param on the booking link) */
  @IsOptional()
  facilityId?: number;
}
