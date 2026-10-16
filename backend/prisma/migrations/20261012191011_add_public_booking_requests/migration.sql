-- CreateTable
CREATE TABLE `public_booking_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referenceNumber` VARCHAR(60) NOT NULL,
    `patientName` VARCHAR(150) NOT NULL,
    `patientPhone` VARCHAR(30) NOT NULL,
    `patientEmail` VARCHAR(255) NULL,
    `preferredDate` DATETIME(3) NOT NULL,
    `preferredTime` VARCHAR(20) NULL,
    `visitReason` TEXT NULL,
    `notes` TEXT NULL,
    `statusCode` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `staffNotes` TEXT NULL,
    `facilityId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `appointmentId` INTEGER NULL,
    `confirmedAt` DATETIME(3) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `public_booking_requests_referenceNumber_key`(`referenceNumber`),
    UNIQUE INDEX `public_booking_requests_appointmentId_key`(`appointmentId`),
    INDEX `public_booking_requests_facilityId_statusCode_idx`(`facilityId`, `statusCode`),
    INDEX `public_booking_requests_facilityId_branchId_statusCode_idx`(`facilityId`, `branchId`, `statusCode`),
    INDEX `public_booking_requests_statusCode_createdAt_idx`(`statusCode`, `createdAt`),
    INDEX `public_booking_requests_patientPhone_idx`(`patientPhone`),
    INDEX `public_booking_requests_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `public_booking_requests` ADD CONSTRAINT `public_booking_requests_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `facilities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `public_booking_requests` ADD CONSTRAINT `public_booking_requests_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `public_booking_requests` ADD CONSTRAINT `public_booking_requests_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
