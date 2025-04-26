-- CreateTable
CREATE TABLE "text_to_image_conversions" (
    "id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "status" "text_to_image_run_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "text_to_image_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "text_to_image_conversions_image_id_idx" ON "text_to_image_conversions"("image_id");

-- AddForeignKey
ALTER TABLE "text_to_image_conversions" ADD CONSTRAINT "text_to_image_conversions_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "text_to_images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
