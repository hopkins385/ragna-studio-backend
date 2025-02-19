/*
  Warnings:

  - You are about to drop the column `cost` on the `token_usages` table. All the data in the column will be lost.
  - You are about to drop the column `llm_model` on the `token_usages` table. All the data in the column will be lost.
  - You are about to drop the column `llm_provider` on the `token_usages` table. All the data in the column will be lost.
  - Added the required column `model_id` to the `token_usages` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "token_usages_user_id_llm_provider_llm_model_index";

-- AlterTable
ALTER TABLE "token_usages" DROP COLUMN "cost",
DROP COLUMN "llm_model",
DROP COLUMN "llm_provider",
ADD COLUMN     "model_id" TEXT NOT NULL,
ADD COLUMN     "reasoning_tokens" INTEGER;

-- CreateTable
CREATE TABLE "llm_prices" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "input_token_price" INTEGER NOT NULL,
    "output_token_price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "llm_prices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "llm_prices" ADD CONSTRAINT "llm_prices_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "llms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usages" ADD CONSTRAINT "token_usages_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "llms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
