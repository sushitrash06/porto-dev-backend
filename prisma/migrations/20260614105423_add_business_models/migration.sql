-- CreateEnum
CREATE TYPE "BusinessProjectType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'INSTITUTIONAL', 'INFRASTRUCTURE', 'RENOVATION', 'INTERIOR_DESIGN', 'OTHER');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'BUSINESS';

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "bannerImage" TEXT,
    "contactEmail" TEXT,
    "phoneNumber" TEXT,
    "location" TEXT,
    "website" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessService" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceStartFrom" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProject" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "projectType" "BusinessProjectType" NOT NULL DEFAULT 'OTHER',
    "clientName" TEXT,
    "thumbnail" TEXT,
    "images" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "BusinessProfile"("userId");

-- CreateIndex
CREATE INDEX "BusinessProfile_isPublic_idx" ON "BusinessProfile"("isPublic");

-- CreateIndex
CREATE INDEX "BusinessService_businessProfileId_idx" ON "BusinessService"("businessProfileId");

-- CreateIndex
CREATE INDEX "BusinessService_isPublic_idx" ON "BusinessService"("isPublic");

-- CreateIndex
CREATE INDEX "BusinessProject_businessProfileId_idx" ON "BusinessProject"("businessProfileId");

-- CreateIndex
CREATE INDEX "BusinessProject_isPublic_idx" ON "BusinessProject"("isPublic");

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessService" ADD CONSTRAINT "BusinessService_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProject" ADD CONSTRAINT "BusinessProject_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
