async function post(url) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" } });
  return res.json();
}

function money(n){ return `Rs ${n}`; }

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  btn.disabled = true;

  try {
    const data = await post(action === "inc" ? `/cart/inc/${id}` : `/cart/dec/${id}`);
    if (!data.ok) return;

    // quick UI update
    const row = document.querySelector(`[data-row="${id}"]`);
    const qtyEl = row?.querySelector("[data-qty]");
    const totalQtyEl = document.querySelector("[data-cartqty]");
    const totalPriceEl = document.querySelector("[data-carttotal]");

    const item = data.cart.items[id];
    if (!item && row) row.remove(); // removed when qty reaches 0
    if (item && qtyEl) qtyEl.textContent = item.qty;

    if (totalQtyEl) totalQtyEl.textContent = data.cart.totalQty;
    if (totalPriceEl) totalPriceEl.textContent = money(data.cart.totalPrice);

    // if cart empty show empty state
    if (data.cart.totalQty === 0) location.reload();
  } finally {
    btn.disabled = false;
  }
});
