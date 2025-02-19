/*
  Warnings:

  - You are about to drop the column `timestamp` on the `credit_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `credit_purchases` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `credit_purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `credit_purchases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "credit_purchases" DROP CONSTRAINT "credit_purchases_userId_fkey";

-- AlterTable
ALTER TABLE "credit_purchases" DROP COLUMN "timestamp",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
