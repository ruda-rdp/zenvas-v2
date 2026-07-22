/**
 * lib/odoo.ts — Odoo API Client (ADR-0001)
 *
 * Integrates with self-hosted Odoo for:
 * - Client (res.partner) creation
 * - Invoice (account.move) creation
 * - Invoice status reading
 *
 * Uses JSON-RPC API (not XML-RPC) for communication.
 * Manual trigger is acceptable for Phase 1 MVP.
 */

import { prisma } from "@/lib/db";

// Odoo connection configuration from environment
const ODOO_CONFIG = {
  url: process.env.ODOO_URL || "https://bisnis.kreatifproduction.com",
  db: process.env.ODOO_DB || "kreatifproduction",
  username: process.env.ODOO_USERNAME || "admin",
  apiKey: process.env.ODOO_API_KEY || "",
  // JSON-RPC endpoint (single endpoint for all services)
  jsonrpcPath: "/jsonrpc",
};

// Types for Odoo responses
interface OdooResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface OdooPartner {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company_type?: string;
}

interface OdooInvoice {
  id: number;
  name: string;
  state: "draft" | "posted" | "cancel" | "paid";
  amount_total: number;
  partner_id: [number, string];
  invoice_date: string;
  invoice_line_ids: number[];
}

interface SyncResult {
  success: boolean;
  odooId?: number;
  error?: string;
  timestamp: Date;
}

/**
 * Make a JSON-RPC call to Odoo
 * FIXED: Uses /jsonrpc endpoint with proper JSON-RPC 2.0 format
 * Requires uid from odooAuthenticate() to be passed as parameter
 */
async function odooCall<T = unknown>(
  model: string,
  method: string,
  args: unknown[],
  uid: number
): Promise<OdooResult> {
  try {
    const response = await fetch(`${ODOO_CONFIG.url}${ODOO_CONFIG.jsonrpcPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [ODOO_CONFIG.db, uid, ODOO_CONFIG.apiKey, model, method, args],
        },
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (result.error) {
      return {
        success: false,
        error: result.error.message || JSON.stringify(result.error),
      };
    }

    return {
      success: true,
      data: result.result as T,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Authenticate with Odoo and get user ID
 * Returns uid which must be passed to odooCall()
 */
export async function odooAuthenticate(): Promise<{ uid: number } | null> {
  try {
    const response = await fetch(`${ODOO_CONFIG.url}${ODOO_CONFIG.jsonrpcPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "authenticate",
          args: [
            ODOO_CONFIG.db,
            ODOO_CONFIG.username,
            ODOO_CONFIG.apiKey,
            {},
          ],
        },
        id: Date.now(),
      }),
    });

    const result = await response.json();

    if (result.error || !result.result) {
      console.error("Odoo auth failed:", result.error);
      return null;
    }

    return { uid: result.result as number };
  } catch (error) {
    console.error("Odoo auth error:", error);
    return null;
  }
}

/**
 * Check if Odoo is reachable
 */
export async function checkOdooConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${ODOO_CONFIG.url}${ODOO_CONFIG.jsonrpcPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "version",
          args: [],
        },
        id: Date.now(),
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT (res.partner) Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new Client in Odoo (res.partner)
 * Called when a Lead is converted to Client
 * FIXED: Uses authenticated uid from odooAuthenticate()
 */
export async function createOdooClient(clientData: {
  name: string;
  email: string;
  phone?: string;
  companyType?: "company" | "person";
}): Promise<SyncResult> {
  try {
    const auth = await odooAuthenticate();
    if (!auth) {
      return { success: false, error: "Authentication failed", timestamp: new Date() };
    }
    const uid = auth.uid;

    // Search for existing partner with same email
    const searchResult = await odooCall<number[]>(
      "res.partner",
      "search",
      [[["email", "=", clientData.email]]],
      uid
    );

    if (searchResult.success && searchResult.data && (searchResult.data as number[]).length > 0) {
      // Partner already exists
      const partnerId = (searchResult.data as number[])[0];
      return {
        success: true,
        odooId: partnerId,
        timestamp: new Date(),
      };
    }

    // Create new partner
    const createResult = await odooCall<number>(
      "res.partner",
      "create",
      [
        {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone || "",
          company_type: clientData.companyType || "company",
          // Additional fields can be added here
        },
      ],
      uid
    );

    if (createResult.success && createResult.data) {
      return {
        success: true,
        odooId: createResult.data as number,
        timestamp: new Date(),
      };
    }

    return {
      success: false,
      error: createResult.error || "Failed to create partner",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

/**
 * Get Client from Odoo by ID
 * FIXED: Uses authenticated uid
 */
export async function getOdooClient(odooPartnerId: number): Promise<OdooPartner | null> {
  const auth = await odooAuthenticate();
  if (!auth) return null;
  
  const result = await odooCall<OdooPartner[]>(
    "res.partner",
    "read",
    [[odooPartnerId], ["id", "name", "email", "phone", "company_type"]],
    auth.uid
  );

  if (result.success && result.data && (result.data as OdooPartner[]).length > 0) {
    return (result.data as OdooPartner[])[0];
  }

  return null;
}

/**
 * Sync Client from Zenvas to Odoo
 * Updates existing or creates new
 * FIXED: Uses authenticated uid
 */
export async function syncClientToOdoo(clientId: string): Promise<SyncResult> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { brand: true },
  });

  if (!client) {
    return { success: false, error: "Client not found", timestamp: new Date() };
  }

  const auth = await odooAuthenticate();
  if (!auth) {
    return { success: false, error: "Authentication failed", timestamp: new Date() };
  }
  const uid = auth.uid;

  // If client already has Odoo partner ID, update it
  if (client.odooPartnerId) {
    const updateResult = await odooCall<boolean>(
      "res.partner",
      "write",
      [
        [parseInt(client.odooPartnerId)],
        {
          name: client.name,
          email: client.email,
        },
      ],
      uid
    );

    return {
      success: updateResult.success,
      odooId: parseInt(client.odooPartnerId),
      error: updateResult.error,
      timestamp: new Date(),
    };
  }

  // Create new in Odoo
  const createResult = await createOdooClient({
    name: client.name,
    email: client.email,
  });

  if (createResult.success && createResult.odooId) {
    // Update Zenvas with Odoo partner ID
    await prisma.client.update({
      where: { id: clientId },
      data: { odooPartnerId: createResult.odooId.toString() },
    });
  }

  return createResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE (account.move) Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an Invoice in Odoo (account.move)
 * Type: "out_invoice" for customer invoices
 * FIXED: Uses authenticated uid from odooAuthenticate()
 */
export async function createOdooInvoice(invoiceData: {
  partnerId: number; // Odoo partner ID
  lines: Array<{
    name: string;
    quantity: number;
    priceUnit: number;
    accountId?: number;
  }>;
  reference?: string; // Zenvas Order ID as reference
  date?: string;
}): Promise<SyncResult> {
  try {
    const auth = await odooAuthenticate();
    if (!auth) {
      return { success: false, error: "Authentication failed", timestamp: new Date() };
    }
    const uid = auth.uid;

    // Create invoice lines
    const invoiceLines = invoiceData.lines.map((line) => [
      0,
      0,
      {
        name: line.name,
        quantity: line.quantity,
        price_unit: line.priceUnit,
        // Use default sales account if not specified
        account_id: line.accountId || 1, // TODO: Look up correct account
      },
    ]);

    const createResult = await odooCall<number>(
      "account.move",
      "create",
      [
        {
          move_type: "out_invoice", // Customer invoice
          partner_id: invoiceData.partnerId,
          invoice_line_ids: invoiceLines,
          ref: invoiceData.reference || "",
          invoice_date: invoiceData.date || new Date().toISOString().split("T")[0],
        },
      ],
      uid
    );

    if (createResult.success && createResult.data) {
      return {
        success: true,
        odooId: createResult.data as number,
        timestamp: new Date(),
      };
    }

    return {
      success: false,
      error: createResult.error || "Failed to create invoice",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

/**
 * Get Invoice from Odoo by ID
 * FIXED: Uses authenticated uid
 */
export async function getOdooInvoice(odooInvoiceId: number): Promise<OdooInvoice | null> {
  const auth = await odooAuthenticate();
  if (!auth) return null;
  
  const result = await odooCall<OdooInvoice[]>(
    "account.move",
    "read",
    [
      [odooInvoiceId],
      [
        "id",
        "name",
        "state",
        "amount_total",
        "partner_id",
        "invoice_date",
        "invoice_line_ids",
      ],
    ],
    auth.uid
  );

  if (result.success && result.data && (result.data as OdooInvoice[]).length > 0) {
    return (result.data as OdooInvoice[])[0];
  }

  return null;
}

/**
 * Get Invoice status from Odoo
 * Returns: "draft" | "posted" | "cancel" | "paid"
 */
export async function getOdooInvoiceStatus(odooInvoiceId: number): Promise<string | null> {
  const invoice = await getOdooInvoice(odooInvoiceId);
  return invoice?.state || null;
}

/**
 * Post an Invoice in Odoo (change state from draft to posted)
 * FIXED: Uses authenticated uid
 */
export async function postOdooInvoice(odooInvoiceId: number): Promise<SyncResult> {
  const auth = await odooAuthenticate();
  if (!auth) {
    return { success: false, error: "Authentication failed", timestamp: new Date() };
  }
  
  const result = await odooCall<boolean>(
    "account.move",
    "action_post",
    [[odooInvoiceId]],
    auth.uid
  );

  return {
    success: result.success && result.data === true,
    odooId: odooInvoiceId,
    error: result.error,
    timestamp: new Date(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sync Order DP Invoice to Odoo
 * Called when Order status changes to CONFIRMED (DP received)
 */
export async function syncOrderDpInvoice(orderId: string): Promise<SyncResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, service: true, brand: true },
  });

  if (!order) {
    return { success: false, error: "Order not found", timestamp: new Date() };
  }

  // Ensure client exists in Odoo
  if (!order.client.odooPartnerId) {
    const clientSync = await syncClientToOdoo(order.clientId);
    if (!clientSync.success || !clientSync.odooId) {
      return clientSync;
    }
    // Refresh order to get updated client.odooPartnerId
    const refreshedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true },
    });
    if (!refreshedOrder?.client.odooPartnerId) {
      return { success: false, error: "Failed to sync client to Odoo", timestamp: new Date() };
    }
  }

  // Create DP invoice
  // For MVP, DP is typically 50% of the total
  const dpAmount = Number(order.service.price) * 0.5;

  const invoiceResult = await createOdooInvoice({
    partnerId: parseInt(order.client.odooPartnerId!),
    lines: [
      {
        name: `DP - ${order.service.name}`,
        quantity: 1,
        priceUnit: dpAmount,
      },
    ],
    reference: `DP-${orderId}`,
    date: new Date().toISOString().split("T")[0],
  });

  if (invoiceResult.success && invoiceResult.odooId) {
    // Store invoice ID in Order
    await prisma.order.update({
      where: { id: orderId },
      data: { odooInvoiceDpId: invoiceResult.odooId.toString() },
    });

    // Auto-post the DP invoice
    await postOdooInvoice(invoiceResult.odooId);
  }

  return invoiceResult;
}

/**
 * Sync Order Final Invoice to Odoo
 * Called when Project delivery is approved
 * FIXED: Added client sync check (same as syncOrderDpInvoice)
 */
export async function syncOrderFinalInvoice(orderId: string): Promise<SyncResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, service: true, brand: true },
  });

  if (!order) {
    return { success: false, error: "Order not found", timestamp: new Date() };
  }

  // FIXED: Ensure client exists in Odoo (same pattern as syncOrderDpInvoice)
  if (!order.client.odooPartnerId) {
    const clientSync = await syncClientToOdoo(order.clientId);
    if (!clientSync.success || !clientSync.odooId) {
      return clientSync;
    }
    // Refresh order to get updated client.odooPartnerId
    const refreshedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true },
    });
    if (!refreshedOrder?.client.odooPartnerId) {
      return { success: false, error: "Failed to sync client to Odoo", timestamp: new Date() };
    }
    // Use refreshed partner ID
    order.client.odooPartnerId = refreshedOrder.client.odooPartnerId;
  }

  // Get DP amount for calculation
  const dpAmount = Number(order.service.price) * 0.5;
  const finalAmount = Number(order.service.price) - dpAmount;

  const invoiceResult = await createOdooInvoice({
    partnerId: parseInt(order.client.odooPartnerId!),
    lines: [
      {
        name: `Final Payment - ${order.service.name}`,
        quantity: 1,
        priceUnit: finalAmount,
      },
    ],
    reference: `FINAL-${orderId}`,
    date: new Date().toISOString().split("T")[0],
  });

  if (invoiceResult.success && invoiceResult.odooId) {
    // Store invoice ID in Order
    await prisma.order.update({
      where: { id: orderId },
      data: { odooInvoiceFinalId: invoiceResult.odooId.toString() },
    });
  }

  return invoiceResult;
}

/**
 * Check and sync Odoo invoice status for an Order
 * Used for periodic auto-check (Phase 1) or manual trigger
 */
export async function checkOrderOdooStatus(orderId: string): Promise<{
  dpStatus: string | null;
  finalStatus: string | null;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { dpStatus: null, finalStatus: null };
  }

  let dpStatus: string | null = null;
  let finalStatus: string | null = null;

  if (order.odooInvoiceDpId) {
    dpStatus = await getOdooInvoiceStatus(parseInt(order.odooInvoiceDpId));
  }

  if (order.odooInvoiceFinalId) {
    finalStatus = await getOdooInvoiceStatus(parseInt(order.odooInvoiceFinalId));
  }

  return { dpStatus, finalStatus };
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notify Owner about Odoo sync error
 * TODO: Implement actual notification (email, push, etc.)
 */
export async function notifyOdooError(error: string, context: string): Promise<void> {
  console.error(`[Odoo Sync Error] ${context}:`, error);

  // TODO: Send notification to Owner
  // Options:
  // - Email via SendGrid/Resend
  // - Push notification
  // - Log to Activity for in-app notification
  // - WhatsApp message

  // For now, just log
  // In production, this should send a notification to the Owner
}

// Export config for testing/debugging
export { ODOO_CONFIG };
