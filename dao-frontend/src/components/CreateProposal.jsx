import { useState } from "react";
import { useWalletStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateProposal() {
  const { createProposal } = useWalletStore();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [useSummary, setUseSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();

  const fetchAISummary = async () => {
    if (!description || !amount)
      return toast.error("Enter description and amount first!");
    setLoadingAI(true);
    try {
      const res = await fetch(
        "https://ai-backend-weld.vercel.app/ai/summarize",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, amount }),
        }
      );
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error("Gemini AI error:", err);
      toast.error("AI summarization failed");
    }
    setLoadingAI(false);
  };

  const handleSubmit = async () => {
    if (!recipient || !amount || !description)
      return toast.error("Fill all fields!");
    setLoadingSubmit(true);

    const finalDescription = useSummary && summary ? summary : description;

    try {
      await createProposal(recipient, amount, finalDescription);

      navigate("/");
      setRecipient("");
      setAmount("");
      setDescription("");
      setSummary("");
      setUseSummary(false);
    } catch (err) {
      console.error("Create proposal error:", err);
      toast.error("Failed to create proposal");
    }

    setLoadingSubmit(false);
  };

  return (
    <div className="bg-light  rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-xl font-bold text-indigo-600">Create Proposal</h3>

      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <input
        type="number"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
      />

      <label className="flex items-center space-x-2 text-gray-700">
        <input
          type="checkbox"
          checked={useSummary}
          onChange={() => setUseSummary(!useSummary)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
        <span>Use AI Summary</span>
      </label>

      {useSummary && (
        <div className="space-y-3">
          <button
            onClick={fetchAISummary}
            disabled={loadingAI}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-500 disabled:opacity-50"
          >
            {loadingAI ? "Summarizeing..." : "Summarize with Gemini AI"}
          </button>

          {summary && (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-100">
              <h4 className="font-semibold text-gray-900">AI Summary</h4>
              <p className="text-gray-700">{summary}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loadingSubmit}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
      >
        {loadingSubmit ? "Creating" : "Create Proposal"}
      </button>
    </div>
  );
}
