const AVATAR_COLORS = [
  { bg: "#e2e8f0", fg: "#334155" },
  { bg: "#dbeafe", fg: "#1d4ed8" },
  { bg: "#dcfce7", fg: "#15803d" },
  { bg: "#fef3c7", fg: "#b45309" },
  { bg: "#fee2e2", fg: "#b91c1c" },
  { bg: "#f3e8ff", fg: "#7e22ce" },
];

export const getAvatarSeed = (user) => {
  if (!user) return "user";
  return `${user.id || user.email || user.name || "user"}`;
};

export const getAvatarInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

export const getAvatarFallbackStyle = (user) => {
  const seed = getAvatarSeed(user);
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const palette = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return {
    backgroundColor: palette.bg,
    color: palette.fg,
  };
};
