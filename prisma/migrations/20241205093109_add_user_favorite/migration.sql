-- CreateTable
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "favorite_id" TEXT NOT NULL,
    "favorite_type" TEXT NOT NULL,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
