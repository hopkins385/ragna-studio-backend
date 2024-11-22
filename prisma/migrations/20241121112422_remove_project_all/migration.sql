/*
  Warnings:

  - You are about to drop the column `project_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `team_id` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_project_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_team_id_fkey";

-- DropIndex
DROP INDEX "documents_project_id_name_index";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "project_id",
ADD COLUMN     "team_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "projects";

-- CreateIndex
CREATE INDEX "documents_team_id_name_index" ON "documents"("team_id", "name");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
