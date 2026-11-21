import { h, icon, fmt } from "../dom.js";
import { api } from "../api.js";
import { pageHead } from "./common.js";

// Storage for the data folder, for administrators: what is used, what the environment is expected to need, and the settings that drive the estimate.
const card = (title, ...kids) => h("div", { class: "card" }, h("h3", { text: title }), ...kids);

const LABELS = {
  users: ["People in the tenant", ""],
  retentionDays: ["Days of daily sweeps kept", "days"],
  sources: ["Data sources switched on", ""],
  kbPerUserSourceDay: ["Usage rows kept per person, per source, per day", "KB"],
  baseGB: ["Application, logs and audit trail", "GB"],
  uploadsGB: ["Uploaded workbooks and documents", "GB"],
  headroom: ["Spare space for growth", "of the estimate"],
};

export async function render() {
  const root = h("div", {}, pageHead("Storage", "How much space the data folder needs for this environment, and how much it uses now. Change the figures in the storage block of config/powerplatform.json."));
  let s;
  try { s = await api.storage(); } catch (e) { return root.append(h("div", { class: "banner error", text: e.message })), root; }

  root.append(h("div", { class: "banner " + (s.verdict === "ok" ? "info" : "error") }, icon("shield"), h("span", { text: s.message })));

  const stat = (label, value) => h("div", { class: "card" }, h("div", { class: "muted", text: label }), h("div", { style: { font: "600 28px var(--font-display)", marginTop: "6px" }, text: value }));
  root.append(h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" } },
    stat("Estimated need", `${fmt.n(s.estimateGB)} GB`),
    stat("Used now", `${fmt.n(s.usedGB)} GB`),
    stat("Free on this disk", `${fmt.n(s.freeGB)} GB`)));

  const rows = Object.keys(LABELS).map((k) => [LABELS[k][0], `${fmt.n(s.settings[k])}${LABELS[k][1] ? " " + LABELS[k][1] : ""}`]);
  root.append(card("What the estimate assumes", h("dl", { class: "kv" }, rows.flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })])),
    h("p", { class: "muted", text: s.note })));
  return root;
}
