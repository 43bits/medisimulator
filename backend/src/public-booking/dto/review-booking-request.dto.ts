import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export enum BookingReviewAction {
  CONFIRM = 'CONFIRMED',
  REJECT = 'REJECTED',
}

export class ReviewBookingRequestDto {
  @IsEnum(BookingReviewAction)
  action: BookingReviewAction;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(500)
  staffNotes?: string;
}
