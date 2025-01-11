/*
  Warnings:

  - You are about to drop the column `system_prompt_token_count` on the `assistant_templates` table. All the data in the column will be lost.
  - Made the column `description` on table `assistant_template_categories` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `system_prompt` on the `assistant_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "assistant_template_categories" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "assistant_templates" DROP COLUMN "system_prompt_token_count",
DROP COLUMN "system_prompt",
ADD COLUMN     "system_prompt" JSON NOT NULL;

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_ables" (
    "id" TEXT NOT NULL,
    "translation_id" TEXT NOT NULL,
    "model_type" SMALLINT NOT NULL,
    "model_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "translation_ables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_ables" ADD CONSTRAINT "translation_ables_translation_id_fkey" FOREIGN KEY ("translation_id") REFERENCES "translations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
