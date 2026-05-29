import { getApiBaseUrl } from "./apiClient";

const allowedProfileMimeTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/heic", "image/heif", "image/webp"]);

export const PROFILE_IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/svg+xml,image/heic,image/heif,image/webp,.png,.jpg,.jpeg,.svg,.heic,.heif,.webp";

export const isAllowedProfileImageFile = (file) => {
  if (!file?.type) return false;
  return allowedProfileMimeTypes.has(file.type.toLowerCase());
};

export const resolveMediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  return `${getApiBaseUrl()}/${String(value).replace(/^\/+/, "")}`;
};

export const getMemberSinceLabel = (registeredAt) => {
  if (!registeredAt) return "-";
  const date = new Date(registeredAt);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
};
