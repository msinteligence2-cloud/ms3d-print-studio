import { z } from "zod";

/** Mirrors the SQL check constraints and transition function. The database is the source of truth. */
export const REQUEST_STATUSES = [
  "recebido",
  "em_analise",
  "aguardando_informacoes",
  "orcamento_enviado",
  "aguardando_aprovacao",
  "aguardando_pagamento",
  "aprovado",
  "em_producao",
  "pos_processamento",
  "pronto",
  "concluido",
  "cancelado",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  aguardando_informacoes: "Aguardando informações",
  orcamento_enviado: "Orçamento enviado",
  aguardando_aprovacao: "Aguardando aprovação",
  aguardando_pagamento: "Aguardando pagamento",
  aprovado: "Aprovado",
  em_producao: "Em produção",
  pos_processamento: "Pós-processamento",
  pronto: "Pronto p/ retirada/envio",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger" | "brand";
export const STATUS_TONE: Record<RequestStatus, StatusTone> = {
  recebido: "brand",
  em_analise: "info",
  aguardando_informacoes: "warning",
  orcamento_enviado: "warning",
  aguardando_aprovacao: "warning",
  aguardando_pagamento: "warning",
  aprovado: "info",
  em_producao: "info",
  pos_processamento: "info",
  pronto: "success",
  concluido: "success",
  cancelado: "danger",
};

const STAFF_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  recebido: ["em_analise", "aguardando_informacoes", "cancelado"],
  em_analise: ["aguardando_informacoes", "cancelado"],
  aguardando_informacoes: ["em_analise", "cancelado"],
  orcamento_enviado: ["aguardando_aprovacao", "em_analise", "cancelado"],
  aguardando_aprovacao: ["em_analise", "cancelado"],
  aguardando_pagamento: ["aprovado", "cancelado"],
  aprovado: ["em_producao", "cancelado"],
  em_producao: ["pos_processamento", "pronto", "cancelado"],
  pos_processamento: ["pronto", "cancelado"],
  pronto: ["concluido"],
  concluido: [],
  cancelado: [],
};

export function allowedStaffTransitions(from: RequestStatus): RequestStatus[] {
  return STAFF_TRANSITIONS[from] ?? [];
}
export function isTransitionAllowed(from: RequestStatus, to: RequestStatus): boolean {
  return allowedStaffTransitions(from).includes(to);
}
/** Confirming payment (aguardando_pagamento -> aprovado) is restricted to owner/admin. */
export function transitionRequiresManager(from: RequestStatus, to: RequestStatus) {
  return from === "aguardando_pagamento" && to === "aprovado";
}
export const CUSTOMER_CANCELLABLE: RequestStatus[] = [
  "recebido",
  "em_analise",
  "aguardando_informacoes",
  "orcamento_enviado",
  "aguardando_aprovacao",
];
export const QUOTABLE: RequestStatus[] = [
  "recebido",
  "em_analise",
  "aguardando_informacoes",
  "orcamento_enviado",
  "aguardando_aprovacao",
];
export const AWAITING_DECISION: RequestStatus[] = ["orcamento_enviado", "aguardando_aprovacao"];
export const CLOSED: RequestStatus[] = ["concluido", "cancelado"];

/** Customer-facing progress steps for the timeline. */
export const PROGRESS_STEPS: { key: RequestStatus; label: string }[] = [
  { key: "recebido", label: "Recebido" },
  { key: "em_analise", label: "Análise" },
  { key: "orcamento_enviado", label: "Orçamento" },
  { key: "aprovado", label: "Aprovado" },
  { key: "em_producao", label: "Produção" },
  { key: "pronto", label: "Pronto" },
  { key: "concluido", label: "Concluído" },
];
export function progressIndex(status: RequestStatus): number {
  const map: Record<RequestStatus, number> = {
    recebido: 0,
    em_analise: 1,
    aguardando_informacoes: 1,
    orcamento_enviado: 2,
    aguardando_aprovacao: 2,
    aguardando_pagamento: 2,
    aprovado: 3,
    em_producao: 4,
    pos_processamento: 4,
    pronto: 5,
    concluido: 6,
    cancelado: -1,
  };
  return map[status];
}

// Roles
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer" | "customer";
export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Operador",
  viewer: "Leitura",
  customer: "Cliente",
};
export const isStaffRole = (r: WorkspaceRole) => r !== "customer";
export const canOperate = (r: WorkspaceRole) => r === "owner" || r === "admin" || r === "member";
export const canManage = (r: WorkspaceRole) => r === "owner" || r === "admin";

// Materials
export const MATERIALS = ["PLA", "PETG", "ABS", "TPU", "ASA", "RESINA", "OUTRO"] as const;
export const MATERIAL_LABEL: Record<(typeof MATERIALS)[number], string> = {
  PLA: "PLA",
  PETG: "PETG",
  ABS: "ABS",
  TPU: "TPU (flexível)",
  ASA: "ASA",
  RESINA: "Resina",
  OUTRO: "Outro / a definir",
};

export const requestFormSchema = z
  .object({
    title: z.string().trim().min(3, "Mínimo 3 caracteres").max(120),
    description: z.string().trim().min(10, "Descreva com pelo menos 10 caracteres").max(5000),
    quantity: z.coerce.number().int("Número inteiro").min(1).max(10000),
    material: z.enum(MATERIALS),
    color: z.string().trim().max(60).optional().default(""),
    dimensions: z.string().trim().max(120).optional().default(""),
    purpose: z.string().trim().max(300).optional().default(""),
    desired_date: z
      .string()
      .optional()
      .default("")
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida"),
    notes: z.string().trim().max(2000).optional().default(""),
    delivery_method: z.enum(["retirada", "envio"]),
    delivery_address: z.string().trim().max(400).optional().default(""),
  })
  .refine((v) => v.delivery_method !== "envio" || v.delivery_address.length >= 10, {
    message: "Informe o endereço completo para envio",
    path: ["delivery_address"],
  });
export type RequestForm = z.infer<typeof requestFormSchema>;

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Mensagem vazia").max(4000, "Máximo 4000 caracteres"),
});

// Files
export const REQUEST_FILE_EXTENSIONS = ["stl", "3mf", "obj", "step", "stp", "png", "jpg", "jpeg", "pdf"] as const;
export const MAX_REQUEST_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_FILES_PER_REQUEST = 20;
export function fileExtension(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}
export function validateRequestFile(file: { name: string; size: number }): string | null {
  const ext = fileExtension(file.name);
  if (!(REQUEST_FILE_EXTENSIONS as readonly string[]).includes(ext))
    return `${file.name}: formato não aceito (STL, 3MF, OBJ, STEP/STP, PNG, JPG ou PDF).`;
  if (file.size <= 0) return `${file.name}: arquivo vazio.`;
  if (file.size > MAX_REQUEST_FILE_BYTES) return `${file.name}: excede 50 MB.`;
  return null;
}
export function sanitizeFileName(name: string) {
  const ext = fileExtension(name);
  const base = name.slice(0, name.length - (ext ? ext.length + 1 : 0));
  const clean = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80) || "arquivo";
  return ext ? `${clean}.${ext}` : clean;
}
export function mimeForFile(file: { name: string; type: string }) {
  const ext = fileExtension(file.name);
  const known: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    pdf: "application/pdf",
  };
  return known[ext] ?? "application/octet-stream";
}
export const isImageExt = (ext: string) => ["png", "jpg", "jpeg"].includes(ext);

// Quotes
export const QUOTE_ITEM_KINDS = ["material", "maquina", "mao_de_obra", "acabamento", "embalagem", "frete", "outro"] as const;
export type QuoteItemKind = (typeof QUOTE_ITEM_KINDS)[number];
export const QUOTE_KIND_LABEL: Record<QuoteItemKind, string> = {
  material: "Material",
  maquina: "Tempo de máquina",
  mao_de_obra: "Mão de obra",
  acabamento: "Acabamento",
  embalagem: "Embalagem",
  frete: "Frete",
  outro: "Outro",
};
export type QuoteItemInput = { kind: QuoteItemKind; description: string; quantity: number; unit_price_cents: number };

/** Same arithmetic as public.create_quote: line = round(qty*unit); tax over (subtotal - discount). */
export function calculateQuote(items: QuoteItemInput[], discountCents: number, taxPercent: number) {
  if (discountCents < 0 || taxPercent < 0 || taxPercent > 100) throw new RangeError("invalid_amounts");
  const lines = items.map((i) => {
    if (!(i.quantity > 0) || !(i.unit_price_cents >= 0)) throw new RangeError("invalid_item");
    return Math.round(i.quantity * i.unit_price_cents);
  });
  const subtotal = lines.reduce((a, b) => a + b, 0);
  if (discountCents > subtotal) throw new RangeError("discount_exceeds_subtotal");
  const tax = Math.round(((subtotal - discountCents) * taxPercent) / 100);
  return { lines, subtotal, discount: discountCents, tax, total: subtotal - discountCents + tax };
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
export function formatDate(iso: string) {
  return new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("pt-BR");
}

// Plans / subscriptions
export const BILLING_INTERVALS = ["monthly", "quarterly", "semiannual", "yearly"] as const;
export const INTERVAL_LABEL: Record<(typeof BILLING_INTERVALS)[number], string> = {
  monthly: "mensal",
  quarterly: "trimestral",
  semiannual: "semestral",
  yearly: "anual",
};
export const SUB_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente de pagamento",
  active: "Ativa",
  past_due: "Atrasada",
  cancelled: "Cancelada",
  expired: "Expirada",
};
export const planSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(2000).optional().default(""),
  price: z.coerce.number().min(0).max(1_000_000),
  billing_interval: z.enum(BILLING_INTERVALS),
  benefits: z.string().max(3000).optional().default(""),
  monthly_request_limit: z.union([z.literal(""), z.coerce.number().int().min(0)]).optional(),
  monthly_grams_limit: z.union([z.literal(""), z.coerce.number().int().min(0)]).optional(),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  is_visible: z.boolean().default(true),
});

/** Translates database exception codes into friendly Portuguese messages. */
export function friendlyError(err: unknown): string {
  const raw = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : String(err);
  const map: Record<string, string> = {
    forbidden: "Você não tem permissão para esta ação.",
    invalid_transition: "Essa mudança de status não é permitida a partir do status atual.",
    payment_confirmation_requires_admin: "Somente proprietário ou administrador pode confirmar pagamento.",
    not_a_customer: "Sua conta não está vinculada como cliente desta oficina.",
    quote_expired: "Este orçamento expirou. Peça uma nova versão à oficina.",
    quote_not_open: "Este orçamento não está mais aberto para decisão.",
    discount_exceeds_subtotal: "O desconto é maior que o subtotal.",
    invalid_state_for_quote: "O pedido não está em uma etapa que aceite orçamento.",
    cannot_cancel: "Este item não pode mais ser cancelado.",
    request_closed: "Este pedido está encerrado.",
    too_many_files: "Limite de 20 arquivos por pedido atingido.",
    invalid_extension: "Formato de arquivo não aceito.",
    invalid_mime: "Tipo de arquivo não aceito.",
    plan_unavailable: "Plano indisponível.",
    workshop_unavailable: "Esta oficina não está aceitando clientes.",
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  };
  for (const [k, v] of Object.entries(map)) if (raw.includes(k)) return v;
  return "Não foi possível concluir a ação. Tente novamente.";
}
