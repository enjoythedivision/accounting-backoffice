import assert from "node:assert/strict";
import test from "node:test";
import {
  getCustomer,
  createCustomer,
  archiveCustomer,
  restoreCustomer,
} from "../src/features/customers/api/customersApi.js";
import { deleteNote } from "../src/features/customers/api/notesApi.js";
import { setPaymentStatus } from "../src/features/customers/api/paymentsApi.js";

test("loading a customer sends the login cookie", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "http://localhost:5021/api/customers/7");
    assert.equal(options.credentials, "include");
    return Response.json({ id: 7, name: "Customer" });
  });

  const customer = await getCustomer(7);
  assert.equal(customer.name, "Customer");
});

test("creating a customer sends JSON, including a zero fee", async (t) => {
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "include");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { name: "Customer", monthlyFee: 0 });
    return Response.json({ id: 7, name: "Customer", monthlyFee: 0 });
  });

  const customer = await createCustomer({ name: "Customer", monthlyFee: 0 });
  assert.equal(customer.monthlyFee, 0);
});

test("archive, restore, and note deletion accept empty responses", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));

  await archiveCustomer(7);
  await restoreCustomer(7);
  await deleteNote(7, 12);
});

test("marking a month unpaid sends false", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "http://localhost:5021/api/customers/7/payments/2024/1");
    assert.equal(options.method, "PATCH");
    assert.equal(options.credentials, "include");
    assert.deepEqual(JSON.parse(options.body), { isPaid: false });
    return Response.json({ isPaid: false });
  });

  const payment = await setPaymentStatus(7, 2024, 1, false);
  assert.equal(payment.isPaid, false);
});

test("an unsuccessful response throws before trying to read JSON", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("Unauthorized", { status: 401 }));

  await assert.rejects(getCustomer(7), /Could not load the customer/);
});
