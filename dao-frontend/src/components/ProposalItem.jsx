import { useEffect, useState } from "react";
import { useWalletStore } from "../store/useStore";
import ProposalDetails from "./ProposalDetails";
import ProposalVotes from "./ProposalVotes";
import ProposalExecution from "./ProposalExecution";
import VoterInsights from "./VoterInsights";
import { calculateRemainingTime } from "../utils/time";
import { getProposalStateName } from "../utils/states";

export default function ProposalItem({ proposal }) {
  const { governor, queueProposal, executeProposal, voteOnProposal } =
    useWalletStore();

  const [state, setState] = useState("");
  const [forVotes, setForVotes] = useState(null);
  const [againstVotes, setAgainstVotes] = useState(null);
  const [voting, setVoting] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!governor) return;
    const fetchProposalData = async () => {
      const proposalState = await governor.state(proposal.proposalId);
      setState(proposalState.toString());

      if (governor.proposalVotes) {
        const votes = await governor.proposalVotes(proposal.proposalId);
        setForVotes(votes.forVotes.toString());
        setAgainstVotes(votes.againstVotes.toString());
      }

      if (proposalState == 5) {
        const timeLeft = await calculateRemainingTime(
          governor,
          proposal.proposalId
        );
        setRemainingTime(timeLeft);
      }
    };
    fetchProposalData();
  }, [governor, proposal.proposalId]);

  useEffect(() => {
    if (remainingTime === null) return;
    const interval = setInterval(
      () => setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [remainingTime]);

  const handleVote = async (voteType) => {
    setVoting(true);
    await voteOnProposal(proposal.proposalId, voteType);
    setVoting(false);
  };
  const handleQueue = () => queueProposal(proposal.proposalId);
  const handleExecute = () => executeProposal(proposal.proposalId);

  const tabs = [
    { id: "details", label: "Details" },
    { id: "votes", label: "Votes" },
    { id: "insights", label: "AI Insights" },
    { id: "execution", label: "Execution" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Proposal #{proposal.proposalId}
        </h3>
        <span
          className={`px-2 py-1 rounded text-xs font-medium
            ${
              getProposalStateName(state) === "Active"
                ? "bg-green-100 text-green-700"
                : getProposalStateName(state) === "Defeated"
                ? "bg-red-100 text-red-700"
                : getProposalStateName(state) === "Queued"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600"
            }`}
        >
          {getProposalStateName(state) || "Loading..."}
        </span>
      </div>

      <div className="flex gap-3 border-b border-gray-200 dark:border-gray-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium transition 
              ${
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "details" && (
          <ProposalDetails proposal={proposal} state={state} />
        )}

        {activeTab === "votes" && (
          <ProposalVotes
            forVotes={forVotes}
            againstVotes={againstVotes}
            voting={voting}
            handleVote={handleVote}
            state={state}
          />
        )}

        {activeTab === "insights" && (
          <VoterInsights proposalId={proposal.proposalId} />
        )}

        {activeTab === "execution" && (
          <ProposalExecution
            state={state}
            remainingTime={remainingTime}
            handleQueue={handleQueue}
            handleExecute={handleExecute}
          />
        )}
      </div>
    </div>
  );
}
