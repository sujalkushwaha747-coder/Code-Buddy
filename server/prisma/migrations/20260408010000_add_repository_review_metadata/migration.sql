-- AlterTable
ALTER TABLE `CodeReview`
    ADD COLUMN `sourceType` VARCHAR(191) NOT NULL DEFAULT 'paste',
    ADD COLUMN `repositoryOwner` VARCHAR(191) NULL,
    ADD COLUMN `repositoryName` VARCHAR(191) NULL,
    ADD COLUMN `repositoryFullName` VARCHAR(191) NULL,
    ADD COLUMN `filePath` VARCHAR(191) NULL;
