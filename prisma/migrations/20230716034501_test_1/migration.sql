CREATE DATABASE IF NOT EXISTS single_service;

USE single_service;

-- CreateTable
CREATE TABLE `Perusahaan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `no_telp` VARCHAR(255) NOT NULL,
    `kode` VARCHAR(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barang` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `harga` INTEGER NOT NULL CHECK (`harga` > 0),
    `stok` INTEGER NOT NULL CHECK (`stok` >= 0),
    `perusahaan_id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)

) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_perusahaan_id_fkey` FOREIGN KEY (`perusahaan_id`) REFERENCES `Perusahaan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
