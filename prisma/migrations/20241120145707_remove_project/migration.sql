/*
  Warnings:

  - You are about to drop the column `project_id` on the `text_to_image_folders` table. All the data in the column will be lost.
  - Added the required column `team_id` to the `text_to_image_folders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "chat_messages_role_enum" ADD VALUE 'system';
ALTER TYPE "chat_messages_role_enum" ADD VALUE 'tool';

-- DropForeignKey
ALTER TABLE "text_to_image_folders" DROP CONSTRAINT "text_to_image_folders_project_id_fkey";

-- DropIndex
DROP INDEX "text_to_image_folders_project_id_idx";

-- AlterTable
ALTER TABLE "text_to_image_folders" DROP COLUMN "project_id",
ADD COLUMN     "team_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "text_to_image_folders_team_id_idx" ON "text_to_image_folders"("team_id");

-- AddForeignKey
ALTER TABLE "text_to_image_folders" ADD CONSTRAINT "text_to_image_folders_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
