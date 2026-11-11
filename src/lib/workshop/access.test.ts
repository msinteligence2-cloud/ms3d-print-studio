import { describe, expect, it } from "vitest";
import { assignableRoles, canModifyMember } from "./access";

describe("distribuição de acessos", () => {
  it("proprietário pode conceder administrador", () => {
    expect(assignableRoles("owner")).toContain("admin");
  });
  it("administrador não pode conceder administrador", () => {
    expect(assignableRoles("admin")).not.toContain("admin");
    expect(assignableRoles("admin")).toContain("customer");
  });
  it("operador e cliente não distribuem acessos", () => {
    expect(assignableRoles("member")).toEqual([]);
    expect(assignableRoles("customer")).toEqual([]);
  });
  it("ninguém altera o proprietário nem a si mesmo", () => {
    expect(canModifyMember("owner", "owner", false)).toBe(false);
    expect(canModifyMember("owner", "customer", true)).toBe(false);
  });
  it("administrador não altera outro administrador", () => {
    expect(canModifyMember("admin", "admin", false)).toBe(false);
    expect(canModifyMember("admin", "customer", false)).toBe(true);
    expect(canModifyMember("owner", "admin", false)).toBe(true);
  });
});
