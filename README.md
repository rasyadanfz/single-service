# Single Service

## Nama & NIM

Dibuat oleh Rasyadan Faza Safiqur Rahman (18221103)

## Cara Menjalankan

1. Pastikan Docker dan Docker Compose sudah terinstall
2. Clone repository ini dengan menjalankan command
   `git clone https://github.com/rasyadanfz/single-service.git`
3. Buka folder single-service di terminal
   `cd single-service`
4. Jalankan dengan command
   `make start`
5. Single Service dapat diakses pada URL http://localhost:3000

## Design Pattern

1. Builder
   Design pattern Builder digunakan untuk menyusun response yang dikirim. Design pattern ini digunakan karena setiap response dapat memiliki isi yang berbeda-beda sehingga dapat memudahkan dalam pembuatan response. Implementasi Builder di aplikasi ini juga menggunakan Director untuk memudahkan penggunaan.
2. Singleton
   Design pattern Singleton digunakan dalam instansiasi Prisma Client sebagai ORM. Hal ini dilakukan untuk memastikan bahwa hanya satu Client yang digunakan dalam aplikasi sehingga dapat menyederhanakan penggunaan dan menjaga konsistensi.
3. Decorator
   Design pattern Decorator digunakan untuk menambah fungsionalitas retry kepada Prisma Client. Hal ini dilakukan untuk mengurangi terjadinya kegagalan seandainya terjadi error sementara pada database sehingga meningkatkan reliability.

## Tech Stack

Dalam pengembangan Single Service, berikut adalah Technology Stack yang digunakan - Node.js v18.16.1 - Express v4.18.2 - MySQL v5.7 - Prisma v4.16.2

## Endpoint

Berikut adalah endpoint yang dibuat

-   GET /self
-   POST /login
-   GET /barang
-   GET /barang/:id
-   POST /barang
-   UPDATE /barang/:id
-   DELETE /barang/:id
-   GET /perusahaan
-   GET /perusahaan/:id
-   POST /perusahaan
-   UPDATE /perusahaan/:id
-   DELETE /perusahaan/:id
