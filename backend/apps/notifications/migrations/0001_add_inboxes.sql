CREATE TABLE "inboxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(50),
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" varchar(50),
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" varchar(255) NOT NULL
);
