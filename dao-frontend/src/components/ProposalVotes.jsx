import { getProposalStateName } from "../utils/states";
export default function ProposalVotes({
  forVotes,
  againstVotes,
  voting,
  handleVote,
  state,
}) {
  return (
    <div className="mt-4">
      {forVotes !== null && againstVotes !== null && (
        <p className="text-sm text-gray-700 mb-2">
          <strong className="text-white">Votes:</strong>{" "}
          <span className="text-green-600 font-medium">{forVotes} MGT For</span>{" "}
          |{" "}
          <span className="text-red-600 font-medium">
            {againstVotes} MGT Against
          </span>
        </p>
      )}

      {state == 1 ? (
        <div className="flex gap-3">
          <button
            disabled={voting}
            onClick={() => handleVote(1)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {voting ? "Voting..." : "Vote For"}
          </button>

          <button
            disabled={voting}
            onClick={() => handleVote(0)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {voting ? "Voting..." : "Vote Against"}
          </button>

          <button
            disabled={voting}
            onClick={() => handleVote(2)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {voting ? "Voting..." : "Abstain"}
          </button>
        </div>
      ) : (
        <span className="text-sm text-gray-600 italic">
          Proposal is in state:{" "}
          {state == 1 && (
            <span className="font-medium text-indigo-600">
              {getProposalStateName(state)} vote Your Favour!!
            </span>
          )}
          {state == 4 && (
            <span className="font-medium text-indigo-600">
              {getProposalStateName(state)} ready to be Queued!!
            </span>
          )}
          {state == 5 && (
            <span className="font-medium text-indigo-600">
              {getProposalStateName(state)} ready to be Execute!!
            </span>
          )}
          {state == 7 && (
            <span className="font-medium text-indigo-600">
              {getProposalStateName(state)} it is Executed!!
            </span>
          )}
          {state == 3 && (
            <span className="font-medium text-indigo-600">
              {getProposalStateName(state)} sorry it Defeated!!
            </span>
          )}
        </span>
      )}
    </div>
  );
}
