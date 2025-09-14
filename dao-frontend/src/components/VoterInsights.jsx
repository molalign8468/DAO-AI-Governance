import { useState } from "react";
import { useWalletStore } from "../store/useStore";
import { formatJustificationWithBullets } from "../utils/formater";
import Spinner from "./Spinner";

export default function VoterInsights({ proposalId }) {
  const { fetchProposalInsights } = useWalletStore();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProposalInsights(proposalId);
      if (data) setInsights(data);
    } catch (err) {
      setError("Failed to fetch insights");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!insights && !loading && (
        <button
          type="button"
          onClick={handleFetch}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-500 transition"
        >
          Get AI Insights
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center mt-4">
          <Spinner size="w-12 h-12" text="Fetching AI insights..." />
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {insights && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow space-y-3 border border-gray-200">
          <h4 className="text-lg font-semibold text-indigo-600">
            AI Voter Insights
          </h4>

          <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 p-6 rounded-xl shadow-lg border border-indigo-200 text-gray-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-600">Summary:</span>
              <span className="font-mono text-sm">{insights.summary}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-green-600">Risk Score:</span>
              <span className="font-mono text-sm">{insights.riskScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600">
                ROI Prediction:
              </span>
              <span className="font-mono text-sm">
                {insights.roiPrediction}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-pink-600">
                Recommendation:
              </span>
              <span className="font-mono text-sm">
                {insights.recommendation}
              </span>
            </div>
          </div>

          {insights.justification && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
              >
                {expanded ? "Hide Justification" : "See More"}
              </button>

              {expanded && (
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <strong className="block text-gray-900">
                    Justification:
                  </strong>
                  <p>
                    {formatJustificationWithBullets(insights.justification)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
