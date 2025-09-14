import { useState, useEffect } from "react";
import { useWalletStore } from "../store/useStore";

export default function DelegateVotes() {
  const { address, delegateVotes, getDelegation } = useWalletStore();
  const [delegatee, setDelegatee] = useState("");
  const [currentDelegate, setCurrentDelegate] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (address) {
      getDelegation(address).then(setCurrentDelegate);
    }
  }, [address]);

  const handleDelegate = async () => {
    if (!delegatee) return toast.error("Enter an address to delegate");
    setProcessing(true);
    try {
      await delegateVotes(delegatee);
      const updated = await getDelegation(address);
      setCurrentDelegate(updated);
      setDelegatee("");
    } catch (err) {
      console.error(err);
      toast.error("Delegation failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-light rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-xl font-bold text-primary">Delegate Your Votes</h3>

      <p className="text-gray-700">
        Current delegate:{" "}
        <span className="font-mono text-accent">
          {currentDelegate || "None"}
        </span>
      </p>

      <input
        type="text"
        placeholder="Delegate to address"
        value={delegatee}
        onChange={(e) => setDelegatee(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        onClick={handleDelegate}
        disabled={processing}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? "Delegateing.." : "Delegate"}
      </button>
    </div>
  );
}
