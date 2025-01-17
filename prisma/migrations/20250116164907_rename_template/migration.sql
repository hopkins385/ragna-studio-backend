/*
  Warnings:

  - You are about to drop the column `system_prompt` on the `assistant_templates` table. All the data in the column will be lost.
  - Added the required column `assistant_system_prompt` to the `assistant_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assistant_templates" DROP COLUMN "system_prompt",
ADD COLUMN     "assistant_description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "assistant_system_prompt" JSON NOT NULL,
ADD COLUMN     "assistant_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "assistant_tool_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
