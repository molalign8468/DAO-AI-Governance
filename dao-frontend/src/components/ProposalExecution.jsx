import { useState } from "react";
import { formatTime } from "../utils/time";
import { getProposalStateName } from "../utils/states";

export default function ProposalExecution({
  state,
  remainingTime,
  handleQueue,
  handleExecute,
}) {
  const [processing, setProcessing] = useState(false);

  const onQueue = async () => {
    setProcessing(true);
    try {
      await handleQueue();
    } finally {
      setProcessing(false);
    }
  };

  const onExecute = async () => {
    setProcessing(true);
    try {
      await handleExecute();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mt-3 flex gap-3">
      {state == 4 && (
        <button
          onClick={onQueue}
          disabled={processing}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? "Queueing..." : "Queue Proposal"}
        </button>
      )}

      {state != 5 ? (
        <span className="font-medium text-indigo-600">
          it is in state {getProposalStateName(state)}!!
        </span>
      ) : (
        <span className="font-medium text-indigo-600">It is ready to </span>
      )}

      {state == 5 && (
        <button
          onClick={onExecute}
          disabled={remainingTime > 0 || processing}
          className={`px-4 py-2 rounded-lg shadow text-white flex items-center justify-center gap-2 transition
            ${
              remainingTime > 0 || processing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          {processing
            ? "Executing..."
            : remainingTime > 0
            ? `Execute in ${formatTime(remainingTime)}`
            : "Execute"}
        </button>
      )}
    </div>
  );
}
