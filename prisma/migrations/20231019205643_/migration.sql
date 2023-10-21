/*
  Warnings:

  - You are about to drop the column `name` on the `leavechannel` table. All the data in the column will be lost.
  - You are about to drop the column `serverName` on the `leavechannel` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `welcomechannel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `leavechannel` DROP COLUMN `name`,
    DROP COLUMN `serverName`,
    MODIFY `leaveMessage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `welcomechannel` DROP COLUMN `name`,
    MODIFY `welcomeMessage` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `WelcomeChannel` ADD CONSTRAINT `WelcomeChannel_id_fkey` FOREIGN KEY (`id`) REFERENCES `Channel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveChannel` ADD CONSTRAINT `LeaveChannel_id_fkey` FOREIGN KEY (`id`) REFERENCES `Channel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
