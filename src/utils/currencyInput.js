const DIGITS_ONLY = /\D+/g;

const sanitizeDigits = (value) => String(value ?? "").replace(DIGITS_ONLY, "");

export const formatRupiahInput = (value) => {
  const digits = sanitizeDigits(value);
  if (!digits) return "";
  const normalized = digits.replace(/^0+(?=\d)/, "");
  return new Intl.NumberFormat("id-ID").format(Number(normalized));
};

export const parseRupiahInput = (value) => {
  const digits = sanitizeDigits(value);
  return digits ? Number(digits) : 0;
};
