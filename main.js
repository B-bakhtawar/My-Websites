document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("chip")) return;

  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  e.target.classList.add("active");

  const filter = e.target.dataset.filter;
  document.querySelectorAll(".menu-item").forEach(card => {
    const cat = card.dataset.category;
    card.style.display = (filter === "All" || cat === filter) ? "block" : "none";
  });
});
