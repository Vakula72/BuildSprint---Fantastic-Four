CREATE TABLE `agent_traces` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`user_id` text,
	`agent_name` text NOT NULL,
	`task` text NOT NULL,
	`status` text NOT NULL,
	`details` text NOT NULL,
	`tool_used` text,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`job_id` text NOT NULL,
	`status` text NOT NULL,
	`strategy` text NOT NULL,
	`match_score` real NOT NULL,
	`recipient_email` text NOT NULL,
	`tailored_resume` text,
	`cold_email` text,
	`user_approved_at` text,
	`user_approved_by` text,
	`demo_sent_at` text,
	`action_log` text,
	`created_at` text DEFAULT '2026-08-30T05:33:50.752Z' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `candidate_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`headline` text NOT NULL,
	`summary` text NOT NULL,
	`target_titles` text NOT NULL,
	`target_locations` text NOT NULL,
	`github_url` text,
	`linkedin_url` text,
	`portfolio_url` text,
	`resume_file` text,
	`education` text NOT NULL,
	`skills` text NOT NULL,
	`projects` text NOT NULL,
	`experience` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`location` text NOT NULL,
	`workplace_type` text NOT NULL,
	`salary_range` text,
	`description` text NOT NULL,
	`source_url` text,
	`posted_date` text NOT NULL,
	`requirements` text NOT NULL,
	`recruiter_contact` text NOT NULL,
	`company_info` text,
	`scraped_at` text
);
--> statement-breakpoint
CREATE TABLE `skill_gaps` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`skill_name` text NOT NULL,
	`category` text NOT NULL,
	`frequency_across_jobs` integer NOT NULL,
	`impact_level` text NOT NULL,
	`recommended_resource` text,
	`actionable_advice` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`name` text,
	`created_at` text DEFAULT '2026-08-30T05:33:50.750Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);