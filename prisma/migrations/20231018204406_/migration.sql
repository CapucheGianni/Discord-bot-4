-- CreateTable
CREATE TABLE `Server` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL DEFAULT 'k!',
    `jokes` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `jokes` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WelcomeChannel` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `welcomeMessage` VARCHAR(191) NOT NULL DEFAULT 'Welcome on the server!',
    `dm` BOOLEAN NOT NULL DEFAULT false,
    `isActivated` BOOLEAN NOT NULL DEFAULT false,
    `serverId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WelcomeChannel_serverId_key`(`serverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveChannel` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `leaveMessage` VARCHAR(191) NOT NULL DEFAULT 'Goodbye my friend',
    `serverName` VARCHAR(191) NOT NULL DEFAULT 'No server name',
    `isActivated` BOOLEAN NOT NULL DEFAULT false,
    `serverId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `LeaveChannel_serverId_key`(`serverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interaction` (
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `interactionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Interaction_interactionId_key`(`interactionId`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InteractionOption` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `interactionName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Twitch` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `token` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WelcomeChannel` ADD CONSTRAINT `WelcomeChannel_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveChannel` ADD CONSTRAINT `LeaveChannel_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InteractionOption` ADD CONSTRAINT `InteractionOption_interactionName_fkey` FOREIGN KEY (`interactionName`) REFERENCES `Interaction`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;
