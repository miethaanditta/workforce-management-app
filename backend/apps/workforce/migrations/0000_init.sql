CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"staff_id" uuid NOT NULL,
	"attendance_date" timestamp with time zone DEFAULT now() NOT NULL,
	"clock_in" timestamp with time zone,
	"clock_out" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"filename" varchar(255) NOT NULL,
	"content" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"user_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone_no" varchar(20),
	"file_id" uuid
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
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_staff_id_staffs_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;