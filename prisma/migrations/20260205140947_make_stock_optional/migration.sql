-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "salePrice" REAL,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "sku" TEXT,
    "brand" TEXT,
    "sizes" TEXT,
    "colors" TEXT,
    "stock" INTEGER,
    "tags" TEXT,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("brand", "categoryId", "colors", "createdAt", "description", "id", "imageUrl", "isOnSale", "price", "salePrice", "sizes", "sku", "stock", "tags", "title", "updatedAt") SELECT "brand", "categoryId", "colors", "createdAt", "description", "id", "imageUrl", "isOnSale", "price", "salePrice", "sizes", "sku", "stock", "tags", "title", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
