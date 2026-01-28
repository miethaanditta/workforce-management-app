CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "kafka.published" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"message_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"topic" varchar(255) NOT NULL,
	"message" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kafka.received" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"message_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"topic" varchar(255) NOT NULL,
	"message" varchar NOT NULL
);
