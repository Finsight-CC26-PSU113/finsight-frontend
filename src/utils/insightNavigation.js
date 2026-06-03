export const navigateFromInsightAction = (insight, navigate) => {
  if (!insight?.action || !navigate) return false;

  const actionText = `${insight.action}`.toLowerCase();
  if (actionText.includes("tabungan") || actionText.includes("savings")) {
    navigate("/savings");
    return true;
  }
  if (actionText.includes("anggaran") || actionText.includes("budget")) {
    navigate("/budget");
    return true;
  }
  if (actionText.includes("transaksi")) {
    navigate("/transactions");
    return true;
  }
  if (actionText.includes("investasi")) {
    navigate("/investments");
    return true;
  }
  if (actionText.includes("dasbor") || actionText.includes("dashboard")) {
    navigate("/");
    return true;
  }
  return false;
};
