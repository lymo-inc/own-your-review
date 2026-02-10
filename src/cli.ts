#!/usr/bin/env bun

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { Command } from "commander";
import { execaSync } from "execa";
import ora from "ora";

const TEMPLATES_DIR = join(dirname(import.meta.filename), "../templates");

const WORKFLOW_TARGET = ".github/workflows/own-your-review.yml";
const CONFIG_TARGET = ".github/own-your-review-config.yml";
const SKILL_TARGET = ".claude/skills/own-your-review.md";

async function confirm(question: string): Promise<boolean> {
	if (process.env.CI) return true;

	const rl = createInterface({ input: process.stdin, output: process.stdout });
	try {
		const answer = await rl.question(`${question} (y/N): `);
		return answer.trim().toLowerCase() === "y";
	} finally {
		rl.close();
	}
}

function isGitRepo(): boolean {
	try {
		execaSync("git", ["rev-parse", "--show-toplevel"]);
		return true;
	} catch {
		return false;
	}
}

async function init(options: {
	force?: boolean;
	skipConfig?: boolean;
	skipSkill?: boolean;
}) {
	console.log();
	console.log("own-your-review — Stop vibe-merging. Start understanding.");
	console.log();

	// 1. Check git repo
	const spinner = ora("Checking git repository...").start();

	if (!isGitRepo()) {
		spinner.fail(
			"Not a git repository. Run this from the root of your project.",
		);
		process.exit(1);
	}

	spinner.succeed("Git repository found");

	// 2. Write workflow file
	const workflowSpinner = ora("Creating workflow file...").start();

	if (existsSync(WORKFLOW_TARGET) && !options.force) {
		workflowSpinner.warn(`${WORKFLOW_TARGET} already exists`);
		const overwrite = await confirm("  Overwrite?");
		if (!overwrite) {
			ora().info("Keeping existing workflow file");
		} else {
			copyFileSync(join(TEMPLATES_DIR, "workflow.yml"), WORKFLOW_TARGET);
			ora().succeed(`Updated ${WORKFLOW_TARGET}`);
		}
	} else {
		mkdirSync(".github/workflows", { recursive: true });
		copyFileSync(join(TEMPLATES_DIR, "workflow.yml"), WORKFLOW_TARGET);
		workflowSpinner.succeed(`Created ${WORKFLOW_TARGET}`);
	}

	// 3. Write config file
	if (!options.skipConfig) {
		if (existsSync(CONFIG_TARGET) && !options.force) {
			ora().info(`${CONFIG_TARGET} already exists — skipping`);
		} else if (existsSync(CONFIG_TARGET)) {
			copyFileSync(join(TEMPLATES_DIR, "config.yml"), CONFIG_TARGET);
			ora().succeed(`Updated ${CONFIG_TARGET}`);
		} else {
			const createConfig =
				options.force || (await confirm("Create config file with defaults?"));
			if (createConfig) {
				copyFileSync(join(TEMPLATES_DIR, "config.yml"), CONFIG_TARGET);
				ora().succeed(`Created ${CONFIG_TARGET}`);
			}
		}
	}

	// 4. Write Claude Code skill file
	if (!options.skipSkill) {
		if (existsSync(SKILL_TARGET) && !options.force) {
			ora().info(`${SKILL_TARGET} already exists — skipping`);
		} else if (existsSync(SKILL_TARGET)) {
			copyFileSync(join(TEMPLATES_DIR, "skill.md"), SKILL_TARGET);
			ora().succeed(`Updated ${SKILL_TARGET}`);
		} else {
			const createSkill =
				options.force ||
				(await confirm("Install Claude Code skill for local review?"));
			if (createSkill) {
				mkdirSync(".claude/skills", { recursive: true });
				copyFileSync(join(TEMPLATES_DIR, "skill.md"), SKILL_TARGET);
				ora().succeed(`Created ${SKILL_TARGET}`);
			}
		}
	}

	// 5. Next steps
	console.log();
	console.log("Done! Next steps:");
	console.log();
	console.log("  1. Add your Anthropic API key as a repo secret:");
	console.log(
		"     Settings > Secrets and variables > Actions > New repository secret",
	);
	console.log("     Name: ANTHROPIC_API_KEY");
	console.log();
	console.log("  2. Commit and push:");
	console.log(
		"     git add .github/ && git commit -m 'Add own-your-review' && git push",
	);
	console.log();
	console.log("  3. Open a PR — the bot will post comprehension questions.");
	console.log();
	console.log(
		"  4. For interactive quizzes in Claude Code, install the plugin:",
	);
	console.log(
		"     https://github.com/lymo-inc/own-your-review#claude-code-plugin",
	);
	console.log("     Then run: /own-your-review:quiz-me");
	console.log();
	console.log("  Docs: https://github.com/lymo-inc/own-your-review");
	console.log();
}

const program = new Command()
	.name("oyr")
	.description("Stop vibe-merging. Start understanding.")
	.version("1.0.0");

program
	.command("init")
	.description("Initialize own-your-review in the current directory")
	.option("--force", "Overwrite existing files without prompting")
	.option("--skip-config", "Don't create the config file")
	.option("--skip-skill", "Don't install the Claude Code skill")
	.action(init);

program.parse();
