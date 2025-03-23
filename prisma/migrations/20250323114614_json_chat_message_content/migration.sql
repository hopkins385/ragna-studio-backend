/*
  Warnings:

  - Changed the type of `content` on the `chat_messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "content",
ADD COLUMN     "content" JSON NOT NULL;

-- CreateTable
CREATE TABLE "assistant_tool_calls" (
    "id" TEXT NOT NULL,
    "assistant_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "input" JSON,
    "output" JSON,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "context" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assistant_tool_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assistant_tool_calls_assistant_id_tool_id_index" ON "assistant_tool_calls"("assistant_id", "tool_id");

-- AddForeignKey
ALTER TABLE "assistant_tool_calls" ADD CONSTRAINT "assistant_tool_calls_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_tool_calls" ADD CONSTRAINT "assistant_tool_calls_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
