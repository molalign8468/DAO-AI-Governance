import { create } from "zustand";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import GOVERNOR_ABI from "../config/Governor.json";
import TOKEN_ABI from "../config/MyGovernance.json";
import TREASURY_ABI from "../config/Treasury.json";

export const useWalletStore = create((set, get) => ({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  governor: null,
  governorToken: null,
  treasury: null,
  treasuryBalance: null,
  votingPower: null,
  totalSupply: null,
  proposals: [],
  proposalsLen: 0,
  proposalVotingTiming: {},
  block: null,

  connect: async () => {
    const { fetchTreasuryAndTokenInfo, address, fetchProposals } = get();
    if (!window.ethereum) {
      toast.error("MetaMask not found");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const block = await provider.getBlockNumber();

      const governor = new ethers.Contract(
        CONTRACT_ADDRESSES.governor,
        GOVERNOR_ABI,
        signer
      );

      const governorToken = new ethers.Contract(
        CONTRACT_ADDRESSES.token,
        TOKEN_ABI,
        signer
      );
      const treasury = new ethers.Contract(
        CONTRACT_ADDRESSES.treasury,
        TREASURY_ABI,
        signer
      );

      set({
        provider,
        signer,
        address,
        chainId: Number(network.chainId),
        governor,
        governorToken,
        treasury,
        block,
      });
      await fetchTreasuryAndTokenInfo(address);
      await fetchProposals();
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  },

  disconnect: () => {
    set({
      provider: null,
      signer: null,
      address: null,
      chainId: null,
      governor: null,
      governorToken: null,
      treasury: null,
    });
  },

  createProposal: async (to, amount, description) => {
    try {
      const { governor, signer, fetchProposals, treasuryBalance } = get();
      if (!governor || !signer) {
        toast.error("Connect wallet first");

        return;
      }
      if (Number(amount) > Number(treasuryBalance)) {
        return toast.error(
          "Treasury has Insufficient balance for your Proposal "
        );
      }
      console.log(Number(treasuryBalance), Number(amount));
      console.log(Number(treasuryBalance) >= Number(amount));
      const treasuryIface = new ethers.Interface([
        "function transfer(address to, uint256 amount)",
      ]);
      const amountInWei = ethers.parseEther(amount.toString());
      const calldata = treasuryIface.encodeFunctionData("transfer", [
        to,
        amountInWei,
      ]);

      const tx = await governor.propose(
        [CONTRACT_ADDRESSES.treasury],
        [0],
        [calldata],
        description
      );

      console.log("Proposal tx sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Proposal mined:", receipt.transactionHash);
      toast.success("Proposal created successfully!");

      await fetchProposals();

      receipt.logs.forEach((log) => {
        try {
          const parsed = governor.interface.parseLog(log);
          if (parsed.name === "ProposalCreated") {
            console.log("New Proposal ID:", parsed.args[0].toString());
          }
          fetchProposals();
        } catch (err) {}
      });
    } catch (err) {
      console.error("Error creating proposal:", err);
    }
  },
  fetchProposals: async () => {
    try {
      const { governor, provider } = get();
      if (!governor || !provider) return;

      const CHUNK_SIZE = 10000;
      const fromBlock = 9426581;
      const latestBlock = await provider.getBlockNumber();
      let allEvents = [];

      for (let start = fromBlock; start <= latestBlock; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE - 1, latestBlock);
        console.log(`Fetching ProposalCreated events from ${start} to ${end}`);
        const events = await governor.queryFilter(
          governor.filters.ProposalCreated(),
          start,
          end
        );
        allEvents = allEvents.concat(events);
      }

      if (!allEvents.length) {
        console.log("No ProposalCreated events found");
        set({ proposals: [] });
        return;
      }
      const proposals = allEvents.map((event) => ({
        proposalId: event.args.proposalId.toString(),
        proposer: event.args.proposer,
        targets: Array.from(event.args.targets),
        description: event.args.description,
        blockNumber: event.blockNumber,
        calldatas: Array.from(event.args.calldatas),
        values: Array.from(event.args.values),
      }));
      set({ proposals });
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  },
  voteOnProposal: async (proposalId, voteType) => {
    try {
      const { governor, signer, fetchProposals } = get();
      if (!governor || !signer) {
        toast.error("Connect wallet first");
        return;
      }

      const state = await governor.state(proposalId);
      console.log("Proposal state:", state.toString());
      if (state != 1) {
        return toast.error(
          `Proposal is not in Voting state (current: ${state})`
        );
      }

      const tx = await governor.castVote(proposalId, voteType);
      await tx.wait();

      let voteMsg;
      switch (voteType) {
        case 0:
          voteMsg = "You're voting against the proposal.";
          break;
        case 1:
          voteMsg = "You're voting in favor of the proposal.";
          break;
        case 2:
          voteMsg = "You're choosing not to vote for or against the proposal.";
          break;
      }

      console.log(`Proposal ${proposalId}: ${voteMsg}`);
      toast.success(voteMsg);

      const votes = await governor.proposalVotes(proposalId);
      const updatedProposals = get().proposals.map((p) =>
        p.proposalId === proposalId
          ? {
              ...p,
              forVotes: votes.forVotes.toString(),
              againstVotes: votes.againstVotes.toString(),
              abstainVotes: votes.abstainVotes.toString(),
            }
          : p
      );
      await fetchProposals();
      set({ proposals: updatedProposals });
    } catch (err) {
      console.error("Error voting on proposal:", err);
      toast.error("Voting failed!");
    }
  },
  delegateVotes: async (delegateeAddress) => {
    try {
      const { signer, governorToken, fetchProposals } = get();
      if (!signer || !governorToken) {
        toast.error("Connect wallet first");
        return;
      }
      const tx = await governorToken.delegate(delegateeAddress);
      await tx.wait();
      await fetchProposals();

      toast.success(`Successfully delegated votes to ${delegateeAddress}`);
    } catch (err) {
      console.error("Delegation failed:", err);
      toast.error("Delegation failed!");
    }
  },
  getDelegation: async (address) => {
    try {
      const { governorToken } = get();
      if (!governorToken) return null;

      const delegatee = await governorToken.delegates(address);
      return delegatee;
    } catch (err) {
      console.error("Failed to fetch delegation:", err);
      return null;
    }
  },
  queueProposal: async (proposalId) => {
    const { governor, proposals, fetchProposals } = get();
    const proposal = proposals.find((p) => p.proposalId == proposalId);
    if (!proposal) return toast.error("Proposal data not found");

    const { targets, values, calldatas, description } = proposal;
    console.log(targets, values, calldatas, description);

    try {
      if (!governor) return toast.error("Connect wallet first");
      const state = await governor.state(proposalId);
      console.log("Proposal state:", state.toString());
      if (state != 4) {
        return toast.error(
          `Proposal is not in Succeeded state (current: ${state})`
        );
      }
      let hasTimelock = false;
      try {
        if (typeof governor.timelock === "function") {
          const addr = await governor.timelock();
          hasTimelock = addr !== ethers.ZeroAddress;
        }
      } catch {
        hasTimelock = false;
      }
      if (!hasTimelock) {
        toast.error(
          "Governor has no timelock → skipping queue. Use execute instead."
        );
        return;
      }
      console.log("Has timelock", hasTimelock);
      const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));

      console.log("Queuing with:", {
        targets,
        values,
        calldatas,
        descriptionHash,
      });
      const tx = await governor.queue(targets, [0], calldatas, descriptionHash);
      await tx.wait();
      await fetchProposals();
      toast.success("✅ Proposal queued successfully!");
    } catch (err) {
      console.error("❌ Queue error:", err);
      toast.error(`Proposal queue failed: ${err.message}`);
    }
  },
  executeProposal: async (proposalId) => {
    const { governor, proposals, fetchProposals } = get();
    const proposal = proposals.find((p) => p.proposalId == proposalId);
    if (!proposal) return toast.error("Proposal data not found");

    try {
      if (!governor) return toast.error("Connect wallet first");

      const values = [0];
      const targets = proposal.targets;
      const calldatas = proposal.calldatas;
      const descriptionHash = ethers.keccak256(
        ethers.toUtf8Bytes(proposal.description)
      );
      const state = await governor.state(proposalId);
      if (state != 5) {
        return toast.error(`Proposal not in Queued state (current: ${state})`);
      }
      try {
        const eta = (await governor.proposalEta(proposalId)).toString();
        const block = await governor.runner.provider.getBlock("latest");
        if (block.timestamp < eta) {
          return toast.error(
            `Too early to execute. Wait ${
              Number(eta) - block.timestamp
            } more seconds`
          );
        }
      } catch (err) {
        console.warn("No ETA check available:", err);
      }
      console.log("Executing with:", {
        targets,
        values,
        calldatas,
        descriptionHash,
      });
      const tx = await governor.execute(
        targets,
        values,
        calldatas,
        descriptionHash
      );
      await tx.wait();
      await fetchProposals();
      toast.success("✅ Proposal executed successfully!");
    } catch (err) {
      console.error("❌ Execute error:", err.reason);
      toast.error(`Proposal execution failed: ${err.message}`);
    }
  },
  decodeCalldata: (calldata) => {
    const abi = ["function transfer(address to, uint256 amount)"];
    const iface = new ethers.Interface(abi);
    const decoded = iface.decodeFunctionData("transfer", calldata);
    return {
      receipt: decoded[0],
      amount: ethers.formatUnits(decoded[1], 18),
    };
  },

  fetchProposalInsights: async (proposalId) => {
    const { proposals, decodeCalldata } = get();
    const proposal = proposals.find((p) => p.proposalId === proposalId);
    if (!proposal) return null;
    if (proposal.voterInsights) {
      return proposal.voterInsights;
    }
    const fetchInsightsFromAI = async ({ description, amount, receipt }) => {
      const response = await fetch(
        "https://ai-backend-weld.vercel.app/ai/insights",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, amount, receipt }),
        }
      );
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    };
    try {
      const { receipt, amount } = decodeCalldata(proposal.calldatas[0]);
      const result = await fetchInsightsFromAI({
        description: proposal.description,
        amount,
        receipt,
      });
      const unified = {
        ...result.insights,
        justification: result.justification || "",
      };
      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.proposalId === proposalId ? { ...p, voterInsights: unified } : p
        ),
      }));
      console.log(unified);
      return unified;
    } catch (err) {
      console.error("Error fetching voter insights:", err);
      return null;
    }
  },
  fetchTreasuryAndTokenInfo: async (userAddress) => {
    const { treasury, governorToken, fetchProposals, proposals } = get();
    if (!treasury || !governorToken) return;

    try {
      const balance = await treasury.getBalance();
      const balanceETH = ethers.formatEther(balance);
      const votes = await governorToken.getVotes(userAddress);
      const totalSupply = await governorToken.totalSupply();

      await fetchProposals();
      const proposalLen = proposals.length;
      console.log(votes, totalSupply, proposalLen);

      set({
        treasuryBalance: balanceETH,
        votingPower: votes.toString(),
        totalSupply: totalSupply,
        proposalsLen: proposalLen,
      });
      await fetchProposals();
    } catch (err) {
      console.error("Error fetching treasury/token info:", err);
    }
  },
}));
