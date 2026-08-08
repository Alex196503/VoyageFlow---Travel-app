-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(75) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `refresh_token` TEXT NULL,
    `refresh_token_expires_at` DATETIME(3) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `avatar_url` VARCHAR(255) NULL,
    `reset_token` TEXT NULL,
    `reset_token_expires_at` DATETIME(3) NULL,
    `email_verification_token` TEXT NULL,
    `email_verification_token_expires_at` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
