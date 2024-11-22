/*
  Warnings:

  - You are about to drop the column `project_id` on the `workflows` table. All the data in the column will be lost.
  - Added the required column `team_id` to the `workflows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "workflows" DROP CONSTRAINT "workflows_project_id_fkey";

-- DropIndex
DROP INDEX "workflows_project_id_name_index";

-- AlterTable
ALTER TABLE "workflows" DROP COLUMN "project_id",
ADD COLUMN     "team_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "workflows_team_id_name_index" ON "workflows"("team_id", "name");

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
