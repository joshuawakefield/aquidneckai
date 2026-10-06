import { describe, expect, it } from "vitest";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import config from "../../tailwind.config";

describe("Tailwind animation configuration", () => {
  it("generates dialog enter/exit utilities and custom accordion animations", async () => {
    const result = await postcss([
      tailwindcss({
        ...config,
        content: [{ raw: "animate-in animate-out fade-in-0 fade-out-0 animate-accordion-down" }],
      }),
    ]).process("@tailwind utilities;", { from: undefined });

    const declarations = (selector: string) => {
      const values: Record<string, string> = {};
      result.root.walkRules(selector, (rule) => {
        rule.walkDecls((decl) => { values[decl.prop] = decl.value; });
      });
      return values;
    };

    expect(declarations(".animate-in")["animation-name"]).toBe("enter");
    expect(declarations(".animate-out")["animation-name"]).toBe("exit");
    expect(declarations(".fade-in-0")["--tw-enter-opacity"]).toBe("0");
    expect(declarations(".fade-out-0")["--tw-exit-opacity"]).toBe("0");
    expect(declarations(".animate-accordion-down")["animation"]).toBe("accordion-down 0.2s ease-out");
    const keyframes: string[] = [];
    result.root.walkAtRules("keyframes", (rule) => { keyframes.push(rule.params); });
    expect(keyframes).toEqual(expect.arrayContaining(["enter", "exit", "accordion-down"]));
  });
});
