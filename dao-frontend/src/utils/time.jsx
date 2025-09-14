export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const calculateRemainingTime = async (governor, proposalId) => {
  if (!governor.proposalEta) return 0;
  try {
    const eta = Number(await governor.proposalEta(proposalId));
    const provider = governor.runner?.provider;
    const block = await provider.getBlock("latest");
    const now = block.timestamp;
    return eta > now ? eta - now : 0;
  } catch (err) {
    console.error("Error calculating remaining time:", err);
    return 0;
  }
};
