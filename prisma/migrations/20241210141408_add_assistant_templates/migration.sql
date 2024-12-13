-- CreateTable
CREATE TABLE "assistant_templates" (
    "id" TEXT NOT NULL,
    "llm_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "system_prompt_token_count" INTEGER NOT NULL,
    "config" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assistant_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_template_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assistant_template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_template_category_items" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assistant_template_category_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assistant_templates" ADD CONSTRAINT "assistant_templates_llm_id_fkey" FOREIGN KEY ("llm_id") REFERENCES "llms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_template_category_items" ADD CONSTRAINT "assistant_template_category_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "assistant_template_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_template_category_items" ADD CONSTRAINT "assistant_template_category_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assistant_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
