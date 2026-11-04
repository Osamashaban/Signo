import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The pipeline's safety rules (PIPELINE.md, SETUP.md) live in these files.
// These tests stop a later change from quietly weakening them.
const read = (path: string) => readFileSync(path, "utf8");

describe("production migrations", () => {
  const workflow = read(".github/workflows/migrate-production.yml");

  it("only start by hand", () => {
    expect(workflow).toMatch(/^on:\n  workflow_dispatch:/m);
    expect(workflow).not.toMatch(/^\s+(push|pull_request|schedule):/m);
  });

  it("need the exact confirmation phrase and the main branch", () => {
    expect(workflow).toContain("inputs.confirmation != 'apply to production'");
    expect(workflow).toContain("github.ref != 'refs/heads/main'");
  });

  it("back up before applying", () => {
    expect(workflow.indexOf("pg_dump")).toBeGreaterThan(0);
    expect(workflow.indexOf("pg_dump")).toBeLessThan(workflow.indexOf("name: Apply pending migrations"));
  });
});

describe("staging and CI", () => {
  it("never use production secrets", () => {
    for (const file of ["migrate-staging.yml", "ci.yml"]) {
      expect(read(`.github/workflows/${file}`)).not.toContain("PRODUCTION_");
    }
  });
});

describe("pipeline documents", () => {
  it("PIPELINE.md lists all 15 steps", () => {
    const steps = read("PIPELINE.md").match(/^ {0,1}\d{1,2}\. \*\*/gm) ?? [];
    expect(steps.length).toBeGreaterThanOrEqual(15);
  });

  it("the pull request template has its three sections", () => {
    const template = read(".github/pull_request_template.md");
    for (const heading of ["## What changed", "## How to verify", "## Risk flags"]) {
      expect(template).toContain(heading);
    }
  });
});
