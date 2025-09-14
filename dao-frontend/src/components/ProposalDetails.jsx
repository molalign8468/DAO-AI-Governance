import { useWalletStore } from "../store/useStore";
import { getProposalStateName } from "../utils/states";

export default function ProposalDetails({ proposal, state }) {
  const { decodeCalldata } = useWalletStore();
  const decoded = decodeCalldata(proposal.calldatas[0]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-5 mb-4 transition hover:shadow-lg">
      <div className="space-y-2">
        <p className="text-sm text-gray-500">
          <strong className="text-gray-800 dark:text-gray-200">ID:</strong>{" "}
          <span className="font-mono">{proposal.proposalId}</span>
        </p>

        <p>
          <strong className="text-gray-800 dark:text-gray-200">
            Description:
          </strong>{" "}
          {proposal.description}
        </p>

        <p>
          <strong className="text-gray-800 dark:text-gray-200">
            Proposer:
          </strong>{" "}
          <span className="font-mono text-indigo-600 dark:text-indigo-400">
            {proposal.proposer}
          </span>
        </p>

        <p>
          <strong className="text-gray-800 dark:text-gray-200">Amount:</strong>{" "}
          <span className="text-green-600 dark:text-green-400 font-semibold">
            {decoded.amount} ETH
          </span>
        </p>

        <p>
          <strong className="text-gray-800 dark:text-gray-200">Receipt:</strong>{" "}
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {decoded.receipt}
          </span>
        </p>

        <p>
          <strong className="text-gray-800 dark:text-gray-200">State:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-xs font-medium
              ${
                getProposalStateName(state) === "Active"
                  ? "bg-green-100 text-green-700"
                  : getProposalStateName(state) === "Defeated"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            {getProposalStateName(state) || "Loading..."}
          </span>
        </p>
      </div>
    </div>
  );
}
