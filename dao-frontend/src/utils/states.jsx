export function getProposalStateName(state) {
  const states = [
    "Pending",
    "Active",
    "Canceled",
    "Defeated",
    "Succeeded",
    "Queued",
    "Expired",
    "Executed",
  ];
  return states[state] || "Unknown";
}
