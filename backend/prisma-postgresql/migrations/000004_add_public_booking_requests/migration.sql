-- Patient-facing public appointment booking requests (no auth required to submit).
-- Staff review and confirm/reject from the Appointments module.

-- CreateTable
CREATE TABLE "public_booking_requests" (
    "id" SERIAL NOT NULL,
    "bookingRef" VARCHAR(50) NOT NULL,
    "patientName" VARCHAR(150) NOT NULL,
    "patientPhone" VARCHAR(30) NOT NULL,
    "patientEmail" VARCHAR(255),
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" VARCHAR(20),
    "visitReason" TEXT,
    "notes" TEXT,
    "statusCode" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "staffNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" INTEGER,
    "facilityId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_booking_requests_bookingRef_key" ON "public_booking_requests"("bookingRef");

-- CreateIndex
CREATE INDEX "public_booking_requests_statusCode_idx" ON "public_booking_requests"("statusCode");

-- CreateIndex
CREATE INDEX "public_booking_requests_facilityId_idx" ON "public_booking_requests"("facilityId");

-- CreateIndex
CREATE INDEX "public_booking_requests_preferredDate_idx" ON "public_booking_requests"("preferredDate");

-- CreateIndex
CREATE INDEX "public_booking_requests_createdAt_idx" ON "public_booking_requests"("createdAt");
