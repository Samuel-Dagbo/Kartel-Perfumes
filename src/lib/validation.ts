type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const genders = ["male", "female", "unisex"] as const;
const paymentMethods = ["paystack", "cod"] as const;
const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail(error: string): Result<never> {
  return { ok: false, error };
}

export function errorFromUnknown(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid request body");
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string, max = 200): Result<string> {
  if (typeof value !== "string") return fail(`${field} is required`);
  const trimmed = value.trim();
  if (!trimmed) return fail(`${field} is required`);
  if (trimmed.length > max) return fail(`${field} is too long`);
  return ok(trimmed);
}

function optionalString(value: unknown, field: string, max = 500): Result<string | undefined> {
  if (value === undefined || value === null || value === "") return ok(undefined);
  if (typeof value !== "string") return fail(`${field} must be a string`);
  const trimmed = value.trim();
  if (trimmed.length > max) return fail(`${field} is too long`);
  return ok(trimmed);
}

function requiredEmail(value: unknown, field: string): Result<string> {
  const email = requiredString(value, field, 254);
  if (!email.ok) return email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return fail(`Please provide a valid ${field.toLowerCase()}`);
  }
  return ok(email.value.toLowerCase());
}

function requiredNumber(value: unknown, field: string, min: number, max = 10_000_000): Result<number> {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fail(`${field} must be a number`);
  }
  if (value < min || value > max) {
    return fail(`${field} is out of range`);
  }
  return ok(Number(value.toFixed(2)));
}

function requiredInteger(value: unknown, field: string, min: number, max = 10_000): Result<number> {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return fail(`${field} must be an integer`);
  }
  if (value < min || value > max) {
    return fail(`${field} is out of range`);
  }
  return ok(value);
}

function optionalNumber(value: unknown, field: string, min: number, max = 10_000_000): Result<number | undefined> {
  if (value === undefined || value === null || value === "") return ok(undefined);
  return requiredNumber(value, field, min, max);
}

function requiredBoolean(value: unknown, field: string, fallback: boolean): Result<boolean> {
  if (value === undefined || value === null) return ok(fallback);
  if (typeof value !== "boolean") return fail(`${field} must be a boolean`);
  return ok(value);
}

function stringArray(value: unknown, field: string, min = 0, max = 20): Result<string[]> {
  if (!Array.isArray(value)) return fail(`${field} must be an array`);
  if (value.length < min || value.length > max) {
    return fail(`${field} length is out of range`);
  }
  const result: string[] = [];
  for (const item of value) {
    const parsed = optionalString(item, field, 500);
    if (!parsed.ok) return parsed;
    if (parsed.value) result.push(parsed.value);
  }
  return ok(result);
}

function scentNotes(value: unknown): Result<{ top: string[]; heart: string[]; base: string[] }> {
  if (value === undefined || value === null) {
    return ok({ top: [], heart: [], base: [] });
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail("Scent notes must be an object");
  }

  const notes = value as Record<string, unknown>;
  const top = stringArray(notes.top, "Scent notes top", 0, 30);
  const heart = stringArray(notes.heart, "Scent notes heart", 0, 30);
  const base = stringArray(notes.base, "Scent notes base", 0, 30);
  if (!top.ok) return top;
  if (!heart.ok) return heart;
  if (!base.ok) return base;
  return ok({ top: top.value, heart: heart.value, base: base.value });
}

function imageUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
}

export function parseCartItem(value: unknown, index: number): Result<{ productId: string; quantity: number }> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fail(`Item ${index + 1} is invalid`);
  const fields = value as Record<string, unknown>;
  const productId = requiredString(fields.productId, `Item ${index + 1} product id`, 80);
  const quantity = requiredInteger(fields.quantity, `Item ${index + 1} quantity`, 1, 99);
  if (!productId.ok) return productId;
  if (!quantity.ok) return quantity;
  return ok({ productId: productId.value, quantity: quantity.value });
}

export function parseProductBody(body: unknown, partial = false): Result<Record<string, unknown>> {
  const data = asRecord(body);
  const updates: Record<string, unknown> = {};
  const clears: Record<string, 1> = {};

  if (data.name !== undefined) {
    const name = requiredString(data.name, "Product name", 120);
    if (!name.ok) return name;
    updates.name = name.value;
  }

  if (!partial || data.description !== undefined) {
    const description = requiredString(data.description, "Description", 5000);
    if (!description.ok) return description;
    updates.description = description.value;
  }

  if (!partial || data.price !== undefined) {
    const price = requiredNumber(data.price, "Price", 0);
    if (!price.ok) return price;
    updates.price = price.value;
  }

  if (!partial || data.originalPrice !== undefined) {
    if (data.originalPrice === null) {
      clears.originalPrice = 1;
    } else {
      const originalPrice = optionalNumber(data.originalPrice, "Original price", 0);
      if (!originalPrice.ok) return originalPrice;
      updates.originalPrice = originalPrice.value;
    }
  }

  if (!partial || data.images !== undefined) {
    const images = stringArray(data.images, "Images", partial ? 0 : 1, 8);
    if (!images.ok) return images;
    if (!images.value.every(imageUrl)) return fail("Images must be valid URLs");
    updates.images = images.value;
  }

  if (!partial || data.scentNotes !== undefined) {
    const notes = scentNotes(data.scentNotes);
    if (!notes.ok) return notes;
    updates.scentNotes = notes.value;
  }

  if (!partial || data.concentration !== undefined) {
    const concentration = requiredString(data.concentration, "Concentration", 80);
    if (!concentration.ok) return concentration;
    updates.concentration = concentration.value;
  }

  if (!partial || data.volume !== undefined) {
    const volume = requiredInteger(data.volume, "Volume", 1, 1000);
    if (!volume.ok) return volume;
    updates.volume = volume.value;
  }

  if (!partial || data.gender !== undefined) {
    const gender = requiredString(data.gender, "Gender", 20);
    if (!gender.ok) return gender;
    if (!genders.includes(gender.value as (typeof genders)[number])) {
      return fail("Invalid gender");
    }
    updates.gender = gender.value;
  }

  if (!partial || data.brand !== undefined) {
    const brand = requiredString(data.brand, "Brand", 120);
    if (!brand.ok) return brand;
    updates.brand = brand.value;
  }

  if (!partial || data.category !== undefined) {
    const category = requiredString(data.category, "Category", 120);
    if (!category.ok) return category;
    updates.category = category.value;
  }

  if (!partial || data.stock !== undefined) {
    const stock = requiredInteger(data.stock, "Stock", 0);
    if (!stock.ok) return stock;
    updates.stock = stock.value;
  }

  if (!partial || data.isFeatured !== undefined) {
    const isFeatured = requiredBoolean(data.isFeatured, "Featured", false);
    if (!isFeatured.ok) return isFeatured;
    updates.isFeatured = isFeatured.value;
  }

  if (!partial || data.isActive !== undefined) {
    const isActive = requiredBoolean(data.isActive, "Active", true);
    if (!isActive.ok) return isActive;
    updates.isActive = isActive.value;
  }

  return ok({ ...updates, __clear: Object.keys(clears).length ? clears : undefined } as Record<string, unknown>);
}

function applyProductUpdates(updates: Record<string, unknown>) {
  const set: Record<string, unknown> = {};
  let unset: Record<string, 1> | null = null;
  for (const [key, value] of Object.entries(updates)) {
    if (key === "__clear") continue;
    if (value === undefined) continue;
    set[key] = value;
  }
  const clearKeys = updates.__clear as Record<string, 1> | undefined;
  if (clearKeys && typeof clearKeys === "object") {
    unset = {};
    for (const k of Object.keys(clearKeys)) unset[k] = 1;
  }
  return { set, unset };
}

export function buildProductUpdate(updates: Record<string, unknown>) {
  return applyProductUpdates(updates);
}

export function parseCheckoutBody(body: unknown): Result<{
  items: Array<{ productId: string; quantity: number }>;
  customer: { name: string; email: string; phone?: string };
  shippingAddress: { line1: string; line2?: string; city: string; state: string; zip: string; country?: string };
  paymentMethod: "paystack" | "cod";
  paymentReference?: string;
}> {
  const data = asRecord(body);

  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 50) {
    return fail("Cart must contain between 1 and 50 items");
  }

  const items = (data.items as unknown[]).map((item, index) => parseCartItem(item, index));

  const firstFailedItem = items.find((item) => !item.ok);
  if (firstFailedItem) return firstFailedItem;

  const customerRecord = asRecord(data.customer);
  const customerName = requiredString(customerRecord.name, "Customer name", 160);
  const customerEmail = requiredEmail(customerRecord.email, "Customer email");
  const phone = optionalString(customerRecord.phone, "Phone", 40);
  if (!customerName.ok) return customerName;
  if (!customerEmail.ok) return customerEmail;
  if (!phone.ok) return phone;

  const address = asRecord(data.shippingAddress);
  const line1 = requiredString(address.line1, "Address line 1", 200);
  const line2 = optionalString(address.line2, "Address line 2", 200);
  const city = requiredString(address.city, "City", 120);
  const state = requiredString(address.state, "State/region", 120);
  const zip = requiredString(address.zip, "ZIP/postal code", 40);
  const country = optionalString(address.country, "Country", 80);
  if (!line1.ok) return line1;
  if (!line2.ok) return line2;
  if (!city.ok) return city;
  if (!state.ok) return state;
  if (!zip.ok) return zip;
  if (!country.ok) return country;

  const paymentMethod = requiredString(data.paymentMethod, "Payment method", 20);
  if (!paymentMethod.ok) return paymentMethod;
  if (!paymentMethods.includes(paymentMethod.value as (typeof paymentMethods)[number])) {
    return fail("Invalid payment method");
  }

  const paymentReference = optionalString(data.paymentReference, "Payment reference", 160);
  if (!paymentReference.ok) return paymentReference;

  return ok({
    items: items.map((item) => (item as { ok: true; value: { productId: string; quantity: number } }).value),
    customer: { name: customerName.value, email: customerEmail.value, phone: phone.value },
    shippingAddress: { line1: line1.value, line2: line2.value, city: city.value, state: state.value, zip: zip.value, country: country.value || "GH" },
    paymentMethod: paymentMethod.value as "paystack" | "cod",
    paymentReference: paymentReference.value,
  });
}

export function parsePaystackInitializeBody(body: unknown): Result<{ items: Array<{ productId: string; quantity: number }> }> {
  const data = asRecord(body);
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 50) {
    return fail("Cart must contain between 1 and 50 items");
  }

  const items = (data.items as unknown[]).map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return fail(`Item ${index + 1} is invalid`);
    const fields = item as Record<string, unknown>;
    const productId = requiredString(fields.productId, `Item ${index + 1} product id`, 80);
    const quantity = requiredInteger(fields.quantity, `Item ${index + 1} quantity`, 1, 99);
    if (!productId.ok) return productId;
    if (!quantity.ok) return quantity;
    return ok({ productId: productId.value, quantity: quantity.value });
  });

  const firstFailedItem = items.find((item) => !item.ok);
  if (firstFailedItem) return firstFailedItem;

  return ok({ items: items.map((item) => (item as { ok: true; value: unknown }).value) as Array<{ productId: string; quantity: number }> });
}

const salePaymentMethods = ["cash", "card", "transfer"] as const;

export function parseSaleBody(body: unknown): Result<{
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: string;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
}> {
  const data = asRecord(body);

  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 50) {
    return fail("Sale must contain between 1 and 50 items");
  }

  const items = (data.items as unknown[]).map((item, index) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const fields = item as Record<string, unknown>;
      if (fields.productId === undefined && fields.product !== undefined) {
        return parseCartItem({ productId: fields.product, quantity: fields.quantity }, index);
      }
    }
    return parseCartItem(item, index);
  });
  const firstFailedItem = items.find((item) => !item.ok);
  if (firstFailedItem) return firstFailedItem;

  const paymentMethod = requiredString(data.paymentMethod, "Payment method", 20);
  if (!paymentMethod.ok) return paymentMethod;
  if (!salePaymentMethods.includes(paymentMethod.value as (typeof salePaymentMethods)[number])) {
    return fail("Invalid payment method");
  }

  const customerName = optionalString(data.customerName, "Customer name", 160);
  if (!customerName.ok) return customerName;
  const customerEmail = optionalString(data.customerEmail, "Customer email", 254);
  if (!customerEmail.ok) return customerEmail;
  const notes = optionalString(data.notes, "Notes", 1000);
  if (!notes.ok) return notes;

  return ok({
    items: items.map((item) => (item as { ok: true; value: { productId: string; quantity: number } }).value),
    paymentMethod: paymentMethod.value,
    customerName: customerName.value,
    customerEmail: customerEmail.value,
    notes: notes.value,
  });
}

export function parseOrderStatusBody(body: unknown): Result<{ status: string }> {
  const data = asRecord(body);
  const status = requiredString(data.status, "Status", 40);
  if (!status.ok) return status;
  if (!orderStatuses.includes(status.value as (typeof orderStatuses)[number])) {
    return fail("Invalid order status");
  }
  return ok({ status: status.value });
}

export function parseUserRoleUpdateBody(body: unknown): Result<{ userId: string; role?: string; isActive?: boolean }> {
  const data = asRecord(body);
  const userId = requiredString(data.userId, "userId", 80);
  if (!userId.ok) return userId;

  const result: { userId: string; role?: string; isActive?: boolean } = { userId: userId.value };

  if (data.role !== undefined) {
    const role = requiredString(data.role, "Role", 20);
    if (!role.ok) return role;
    if (!["admin", "staff", "customer"].includes(role.value)) return fail("Invalid role");
    result.role = role.value;
  }

  if (data.isActive !== undefined) {
    if (typeof data.isActive !== "boolean") return fail("isActive must be a boolean");
    result.isActive = data.isActive;
  }

  if (!result.role && result.isActive === undefined) {
    return fail("No fields to update");
  }

  return ok(result);
}
