import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const SCRIPT = join(import.meta.dirname, "check-large-files.sh");
const OVER_LIMIT_BYTES = 2 * 1024 * 1024;

/** Run the checker over explicit paths. Exit 0 means "nothing to complain about". */
function check(...paths) {
  const result = spawnSync(SCRIPT, paths, { encoding: "utf-8" });
  return { ok: result.status === 0, stderr: result.stderr ?? "" };
}

function withFiles(files, run) {
  const dir = mkdtempSync(join(tmpdir(), "hf-largefiles-"));
  try {
    const paths = {};
    for (const [name, contents] of Object.entries(files)) {
      paths[name] = join(dir, name);
      writeFileSync(paths[name], contents);
    }
    run(paths);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const bigBinary = Buffer.alloc(OVER_LIMIT_BYTES);
const bigText = "the quick brown fox jumps over the lazy dog\n".repeat(50_000);

describe("check-large-files", () => {
  it("rejects a binary over the limit, and names it", () => {
    withFiles({ "big.bin": bigBinary }, ({ "big.bin": path }) => {
      const { ok, stderr } = check(path);
      assert.equal(ok, false);
      assert.match(stderr, /big\.bin/);
    });
  });

  // The cost this hook exists to stop is a binary one: git delta-compresses
  // text, so a file that grows a few KB per commit costs a few KB. Before this,
  // `docs/changelog.mdx` (half a megabyte of release notes, a little larger
  // every release) failed a check whose own message says "large binaries", and
  // every release had to pass HF_MAX_NONLFS_KB to get through.
  it("accepts a text file over the limit", () => {
    withFiles({ "big.txt": bigText }, ({ "big.txt": path }) => {
      assert.equal(check(path).ok, true);
    });
  });

  it("accepts a binary under the limit", () => {
    withFiles({ "small.bin": Buffer.alloc(1024) }, ({ "small.bin": path }) => {
      assert.equal(check(path).ok, true);
    });
  });

  it("reports every offending binary, not just the first", () => {
    withFiles({ "a.bin": bigBinary, "b.bin": bigBinary }, ({ "a.bin": a, "b.bin": b }) => {
      const { ok, stderr } = check(a, b);
      assert.equal(ok, false);
      assert.match(stderr, /a\.bin/);
      assert.match(stderr, /b\.bin/);
    });
  });

  // The scan loop runs in a pipeline subshell, so the violations file is the
  // only durable signal it has. When mktemp fails — an agent sandbox that
  // denies writes outside the workspace, a read-only or full $TMPDIR — the old
  // script carried on with an empty path: every `>> "$violations"` wrote
  // nowhere, `[ -s "" ]` read as "no violations", and the hook reported ✔️ on a
  // commit it never scanned. A gate that cannot run must fail, not pass.
  it("still scans when $TMPDIR writes are denied, via a workspace-local scratch dir", () => {
    withFiles({ "big.bin": bigBinary }, ({ "big.bin": path }) => {
      const realMktemp = spawnSync("sh", ["-c", "command -v mktemp"], {
        encoding: "utf-8",
      }).stdout.trim();
      const fakeBin = mkdtempSync(join(tmpdir(), "hf-denytmp-"));
      writeFileSync(
        join(fakeBin, "mktemp"),
        // Deny the no-template form (writes outside the workspace), delegate the
        // explicit-template form (writes inside it) — an agent sandbox.
        `#!/bin/sh\nif [ "$#" -eq 0 ]; then echo 'mktemp: Operation not permitted' >&2; exit 1; fi\nexec ${realMktemp} "$@"\n`,
        { mode: 0o755 },
      );
      const workspace = mkdtempSync(join(tmpdir(), "hf-sandbox-ws-"));
      try {
        const result = spawnSync(SCRIPT, [path], {
          cwd: workspace,
          encoding: "utf-8",
          env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH}` },
        });
        // The scan ran through the fallback: it found the file, rather than
        // failing closed on a temp file it could not create.
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /big\.bin/);
        assert.doesNotMatch(result.stderr, /could not create a temporary file/);
      } finally {
        rmSync(fakeBin, { recursive: true, force: true });
        rmSync(workspace, { recursive: true, force: true });
      }
    });
  });

  it("fails closed when it cannot create its temp file", () => {
    withFiles({ "big.bin": bigBinary }, ({ "big.bin": path }) => {
      const fakeBin = mkdtempSync(join(tmpdir(), "hf-nomktemp-"));
      writeFileSync(
        join(fakeBin, "mktemp"),
        "#!/bin/sh\necho 'mktemp: Operation not permitted' >&2\nexit 1\n",
        { mode: 0o755 },
      );
      try {
        const result = spawnSync(SCRIPT, [path], {
          encoding: "utf-8",
          env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH}` },
        });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /could not create a temporary file/);
      } finally {
        rmSync(fakeBin, { recursive: true, force: true });
      }
    });
  });
});
