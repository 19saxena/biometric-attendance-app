-- AlterTable
ALTER TABLE "User" ADD COLUMN     "course" TEXT,
ADD COLUMN     "faceImagePath" TEXT,
ADD COLUMN     "fingerprintImagePath" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'student';
