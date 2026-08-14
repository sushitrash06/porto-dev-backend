/*
  Warnings:

  - The values [SUPER_ADMIN,BUSINESS] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE 
    WHEN "role"::text = 'SUPER_ADMIN' THEN 'ADMIN'::"Role_new"
    WHEN "role"::text = 'BUSINESS' THEN 'USER'::"Role_new"
    ELSE "role"::text::"Role_new"
  END
);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;
