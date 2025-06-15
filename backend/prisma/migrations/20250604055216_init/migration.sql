-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "faceEncoding" DOUBLE PRECISION[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
