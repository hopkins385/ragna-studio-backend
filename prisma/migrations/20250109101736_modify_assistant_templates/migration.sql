/*
  Warnings:

  - You are about to drop the column `system_prompt_token_count` on the `assistant_templates` table. All the data in the column will be lost.
  - Changed the type of `system_prompt` on the `assistant_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "assistant_templates" DROP COLUMN "system_prompt_token_count",
DROP COLUMN "system_prompt",
ADD COLUMN     "system_prompt" JSON NOT NULL;
