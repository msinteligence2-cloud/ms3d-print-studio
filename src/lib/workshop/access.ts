import type { WorkspaceRole } from "./domain";

export type GrantableRole = Exclude<WorkspaceRole, "owner">;

/** Roles the acting staff member may hand out. Only the owner can create admins. */
export function assignableRoles(actor: WorkspaceRole): GrantableRole[] {
  if (actor === "owner") return ["customer", "member", "viewer", "admin"];
  if (actor === "admin") return ["customer", "member", "viewer"];
  return [];
}

/** Whether the actor may change, suspend or remove the target member. */
export function canModifyMember(actor: WorkspaceRole, target: WorkspaceRole, isSelf: boolean): boolean {
  if (isSelf || target === "owner") return false;
  if (actor === "owner") return true;
  if (actor === "admin") return target !== "admin";
  return false;
}

const MESSAGES: Record<string, string> = {
  forbidden: "Você não tem permissão para esta ação.",
  invalid_role: "Tipo de acesso inválido.",
  invalid_email: "Informe um e-mail válido.",
  only_owner_grants_admin: "Somente o proprietário pode criar administradores.",
  only_owner_changes_admin: "Somente o proprietário pode alterar administradores.",
  cannot_change_self: "Você não pode alterar o seu próprio acesso.",
  cannot_change_owner: "O acesso do proprietário não pode ser alterado.",
  not_a_member: "Esta pessoa não tem acesso à oficina.",
  invalid_workspace_name: "O nome da oficina deve ter entre 2 e 80 caracteres.",
};

export function accessErrorMessage(err: unknown): string {
  const raw = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : String(err);
  const key = Object.keys(MESSAGES).find((k) => raw.includes(k));
  return key ? MESSAGES[key] : "Não foi possível concluir. Tente novamente.";
}
