/*
  Warnings:

  - You are about to drop the column `serverId` on the `channel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `channel` DROP FOREIGN KEY `Channel_serverId_fkey`;

-- AlterTable
ALTER TABLE `channel` DROP COLUMN `serverId`;
