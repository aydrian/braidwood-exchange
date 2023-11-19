-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL DEFAULT '',
    "first_name" TEXT NOT NULL DEFAULT 'Corgi Parent',
    "last_name" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "mailing_address" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    CONSTRAINT "mailing_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "corgis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "birth_date" DATETIME NOT NULL,
    "image_uri" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    CONSTRAINT "corgis_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exchange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "due_date" DATETIME NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "entries" (
    "exchange_id" TEXT NOT NULL,
    "santa_id" TEXT NOT NULL,
    "recipient_id" TEXT,
    "notes" TEXT,

    PRIMARY KEY ("exchange_id", "santa_id"),
    CONSTRAINT "entries_exchange_id_fkey" FOREIGN KEY ("exchange_id") REFERENCES "Exchange" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entries_santa_id_fkey" FOREIGN KEY ("santa_id") REFERENCES "corgis" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entries_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "corgis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
