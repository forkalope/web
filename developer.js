const planDetails = {
  "one-tine": { name: "Co-Sysop", price: "$30", units: "1 Tine" },
  "two-tines": { name: "Network Builder", price: "$60", units: "2 Tines" },
  "three-tines": { name: "Node Steward", price: "$90", units: "3 Tines" },
};

// Payment integration will be added after the membership terms are finalized.
const paymentLinks = window.FORKALOPE_PAYMENT_LINKS || {};
const planButtons = document.querySelectorAll("[data-plan]");
const pricing = document.querySelector(".developer-pricing");
const checkout = document.querySelector("#checkout");
const checkoutSummary = document.querySelector(".checkout-summary");
const checkoutStatus = document.querySelector(".checkout-status");
const checkoutSubmit = document.querySelector(".checkout-submit");
const checkoutBack = document.querySelector(".checkout-back");

function selectPlan(plan) {
  const details = planDetails[plan];
  if (!details || !checkout) return;
  checkout.hidden = false;
  checkout.dataset.plan = plan;
  checkoutSummary.textContent = `${details.name} · ${details.units} · ${details.price}/month. Your membership helps sponsor the open Forkalope network; it is not an investment or a share in project revenue.`;
  checkoutStatus.textContent = paymentLinks[plan]
    ? "You’ll continue to the configured payment provider."
    : "Enrollment is not open yet. No account has been created and no payment has been taken.";
  checkoutSubmit.disabled = !paymentLinks[plan];
  checkoutSubmit.setAttribute("aria-disabled", String(!paymentLinks[plan]));
  checkout.scrollIntoView({ behavior: "smooth", block: "start" });
}

planButtons.forEach((button) => button.addEventListener("click", () => selectPlan(button.dataset.plan)));

checkoutSubmit?.addEventListener("click", () => {
  const url = paymentLinks[checkout?.dataset.plan];
  if (url) window.location.assign(url);
});

checkoutBack?.addEventListener("click", () => {
  checkout.hidden = true;
  pricing?.scrollIntoView({ behavior: "smooth", block: "start" });
});
