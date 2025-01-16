-- AlterTable
ALTER TABLE "assistant_template_categories" ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "assistant_template_categories" ADD CONSTRAINT "assistant_template_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "assistant_template_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
