-- CreateTable
CREATE TABLE `CodeReview` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `originalCode` LONGTEXT NOT NULL,
    `summary` TEXT NOT NULL,
    `improvedCode` LONGTEXT NOT NULL,
    `complexityScore` INTEGER NOT NULL,
    `securityScore` INTEGER NOT NULL,
    `overallScore` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CodeReview_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewIssue` (
    `id` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `line` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `recommendation` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReviewIssue_reviewId_idx`(`reviewId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CodeReview` ADD CONSTRAINT `CodeReview_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewIssue` ADD CONSTRAINT `ReviewIssue_reviewId_fkey`
FOREIGN KEY (`reviewId`) REFERENCES `CodeReview`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
