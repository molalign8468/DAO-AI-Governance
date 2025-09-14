import { useEffect, useState } from "react";
import ProposalItem from "./ProposalItem";
import { useWalletStore } from "../store/useStore";
import { getProposalStateName } from "../utils/states";
import Spinner from "./Spinner";

export default function ProposalsList() {
  const { proposals, fetchProposals, governor, address } = useWalletStore();
  const [activeTab, setActiveTab] = useState("Active");
  const [proposalsWithState, setProposalsWithState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProposals = async () => {
      setLoading(true);
      await fetchProposals();
      setLoading(false);
    };
    loadProposals();
  }, [address]);

  useEffect(() => {
    if (!governor || !proposals.length) return;

    const fetchStates = async () => {
      setLoading(true);
      const updated = await Promise.all(
        proposals.map(async (p) => {
          const stateNum = await governor.state(p.proposalId);
          return { ...p, state: stateNum };
        })
      );
      setProposalsWithState(updated);
      setLoading(false);
    };

    fetchStates();
  }, [governor, proposals.proposalId]);

  const categories = ["Active", "Succeeded", "Queued", "Executed", "Defeated"];
  const filteredProposals = proposalsWithState.filter(
    (p) =>
      categories.includes(getProposalStateName(p.state)) &&
      getProposalStateName(p.state) === activeTab
  );

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Proposals</h3>

      <div
        onClick={() => fetchProposals()}
        className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3 py-2 font-medium text-sm transition
              ${
                activeTab === cat
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-10">
          <Spinner size="w-16 h-16" text="Fetching proposals..." />
        </div>
      )}

      {!loading && filteredProposals.length === 0 && (
        <p className="text-gray-500">No {activeTab} proposals yet.</p>
      )}

      {!loading && filteredProposals.length > 0 && (
        <div className="space-y-4">
          {filteredProposals.map((p) => (
            <ProposalItem key={p.proposalId} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
