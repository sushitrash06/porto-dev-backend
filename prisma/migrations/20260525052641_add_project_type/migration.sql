-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('WORK', 'FREELANCE', 'PERSONAL', 'OPEN_SOURCE');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'PERSONAL';
