import { describe, expect, it } from "vitest";
import {
  allowedStaffTransitions,
  calculateQuote,
  canManage,
  canOperate,
  isStaffRole,
  isTransitionAllowed,
  requestFormSchema,
  sanitizeFileName,
  transitionRequiresManager,
  validateRequestFile,
  CUSTOMER_CANCELLABLE,
  messageSchema,
} from "./domain";

describe("status transitions", () => {
  it("allows the production path from approved to concluded", () => {
    expect(isTransitionAllowed("aprovado", "em_producao")).toBe(true);
    expect(isTransitionAllowed("em_producao", "pos_processamento")).toBe(true);
    expect(isTransitionAllowed("pos_processamento", "pronto")).toBe(true);
    expect(isTransitionAllowed("pronto", "concluido")).toBe(true);
  });
  it("blocks skipping payment/approval and reopening closed requests", () => {
    expect(isTransitionAllowed("recebido", "em_producao")).toBe(false);
    expect(isTransitionAllowed("em_analise", "aprovado")).toBe(false);
    expect(allowedStaffTransitions("concluido")).toEqual([]);
    expect(allowedStaffTransitions("cancelado")).toEqual([]);
    expect(isTransitionAllowed("pronto", "cancelado")).toBe(false);
  });
  it("requires a manager to confirm payment", () => {
    expect(transitionRequiresManager("aguardando_pagamento", "aprovado")).toBe(true);
    expect(transitionRequiresManager("aprovado", "em_producao")).toBe(false);
  });
  it("customer can only cancel before approval", () => {
    expect(CUSTOMER_CANCELLABLE).toContain("aguardando_aprovacao");
    expect(CUSTOMER_CANCELLABLE).not.toContain("em_producao");
    expect(CUSTOMER_CANCELLABLE).not.toContain("aguardando_pagamento");
  });
});

describe("permissions", () => {
  it("customers are never staff", () => {
    expect(isStaffRole("customer")).toBe(false);
    expect(canOperate("customer")).toBe(false);
    expect(canManage("customer")).toBe(false);
  });
  it("viewer reads but does not operate; operator operates but does not manage", () => {
    expect(isStaffRole("viewer")).toBe(true);
    expect(canOperate("viewer")).toBe(false);
    expect(canOperate("member")).toBe(true);
    expect(canManage("member")).toBe(false);
    expect(canManage("admin")).toBe(true);
  });
});

describe("quote calculation", () => {
  it("computes lines, discount and tax like the database", () => {
    const r = calculateQuote(
      [
        { kind: "material", description: "PLA 120 g", quantity: 120, unit_price_cents: 12 }, // R$ 120/kg
        { kind: "maquina", description: "3,5 h", quantity: 3.5, unit_price_cents: 800 },
        { kind: "frete", description: "Correios", quantity: 1, unit_price_cents: 2500 },
      ],
      500,
      10,
    );
    expect(r.lines).toEqual([1440, 2800, 2500]);
    expect(r.subtotal).toBe(6740);
    expect(r.tax).toBe(624);
    expect(r.total).toBe(6864);
  });
  it("rejects discount above subtotal and invalid quantities", () => {
    expect(() => calculateQuote([{ kind: "outro", description: "x", quantity: 1, unit_price_cents: 100 }], 101, 0)).toThrow();
    expect(() => calculateQuote([{ kind: "outro", description: "x", quantity: 0, unit_price_cents: 100 }], 0, 0)).toThrow();
    expect(() => calculateQuote([], 0, 120)).toThrow();
  });
});

describe("request form and files", () => {
  const base = { title: "Suporte de parede", description: "Suporte para roteador com 2 furos", quantity: "2", material: "PETG", delivery_method: "retirada" };
  it("accepts a valid request", () => {
    expect(requestFormSchema.safeParse(base).success).toBe(true);
  });
  it("requires an address when shipping", () => {
    const r = requestFormSchema.safeParse({ ...base, delivery_method: "envio", delivery_address: "" });
    expect(r.success).toBe(false);
  });
  it("rejects zero quantity and unknown material", () => {
    expect(requestFormSchema.safeParse({ ...base, quantity: "0" }).success).toBe(false);
    expect(requestFormSchema.safeParse({ ...base, material: "OURO" }).success).toBe(false);
  });
  it("validates file extension and 50 MB limit", () => {
    expect(validateRequestFile({ name: "peca.STL", size: 1000 })).toBeNull();
    expect(validateRequestFile({ name: "esboco.jpg", size: 1000 })).toBeNull();
    expect(validateRequestFile({ name: "virus.exe", size: 1000 })).not.toBeNull();
    expect(validateRequestFile({ name: "big.stl", size: 50 * 1024 * 1024 + 1 })).not.toBeNull();
  });
  it("sanitizes file names", () => {
    expect(sanitizeFileName("../../Peça final (v2).STL")).toBe("._._Peca_final_v2_.stl");
    expect(sanitizeFileName("a b.pdf")).toBe("a_b.pdf");
  });
  it("rejects empty messages", () => {
    expect(messageSchema.safeParse({ body: "   " }).success).toBe(false);
  });
});
