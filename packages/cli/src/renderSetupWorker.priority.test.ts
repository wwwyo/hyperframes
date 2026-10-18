import { constants } from "node:os";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const os = vi.hoisted(() => ({ setPriority: vi.fn() }));
vi.mock("node:os", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:os")>()),
  setPriority: os.setPriority,
}));
vi.mock("./utils/lintProject.js", () => ({ lintProject: vi.fn(async () => ({ ok: true })) }));

beforeEach(() => {
  vi.resetModules();
  os.setPriority.mockReset();
  process.argv[2] = "lint";
  process.env.HYPERFRAMES_RENDER_SETUP_INPUT = JSON.stringify({ projectDir: "/project" });
});

afterEach(() => vi.restoreAllMocks());

it("lints at the lowest CPU priority so it never competes with a Studio boot", async () => {
  const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

  await import("./renderSetupWorker.js");

  expect(os.setPriority).toHaveBeenCalledWith(constants.priority.PRIORITY_LOW);
  expect(write).toHaveBeenCalledWith(expect.stringContaining('{"ok":true}'));
});

// An agent sandbox denies setpriority with EPERM (uv_os_setpriority). The hint is
// best-effort — if it took the worker down, the render's lint gate would abort
// before a single frame was captured, which is exactly the failure this covers.
it("still lints when the host denies the priority syscall", async () => {
  os.setPriority.mockImplementation(() => {
    throw new Error("EPERM: operation not permitted, uv_os_setpriority");
  });
  const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

  await import("./renderSetupWorker.js");

  expect(write).toHaveBeenCalledWith(expect.stringContaining('{"ok":true}'));
});
