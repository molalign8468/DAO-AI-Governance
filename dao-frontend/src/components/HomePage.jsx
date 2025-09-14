import { useEffect, useState } from "react";
import { Users, Cpu, ChartLine, Zap } from "lucide-react";
import { useWalletStore } from "../store/useStore";
import CountUp from "react-countup";
import AnimatedBackground from "./AnimatedBackground";
import { Link } from "react-router-dom";

export default function Home() {
  const { treasuryBalance, votingPower, totalSupply, proposals } =
    useWalletStore();
  const [stats, setStats] = useState({
    treasury: 0,
    votes: 0,
    supply: 0,
    proposalsCount: 0,
  });

  useEffect(() => {
    setStats({
      treasury: parseFloat(treasuryBalance || 0),
      votes: parseFloat(votingPower || 11000),
      supply: parseFloat(totalSupply || 450000),
      proposalsCount: proposals.length || 55,
    });
  }, [treasuryBalance, votingPower, totalSupply, proposals]);

  const features = [
    {
      icon: <Cpu className="w-12 h-12 text-indigo-400" />,
      title: "AI-Powered Proposals",
      description: "AI helps generate, summarize, and optimize DAO proposals.",
    },
    {
      icon: <ChartLine className="w-12 h-12 text-green-400" />,
      title: "Treasury Analytics",
      description: "Live treasury monitoring with AI-driven ROI predictions.",
    },
    {
      icon: <Users className="w-12 h-12 text-yellow-400" />,
      title: "Community Governance",
      description: "Token-weighted voting enhanced with AI insights.",
    },
    {
      icon: <Zap className="w-12 h-12 text-pink-400" />,
      title: "Fast Execution",
      description: "Smart contracts automate secure execution of proposals.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <section className="relative flex flex-col items-center justify-center text-center py-28 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <AnimatedBackground />
        <h1 className="relative z-10 text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
          DAO AI Governance
        </h1>
        <p className="relative z-10 text-xl max-w-2xl mb-8">
          The fusion of decentralized governance and AI intelligence.
        </p>

        <Link
          to="/create"
          className="relative z-10 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-xl hover:bg-gray-100 hover:scale-105 transition"
        >
          Connect and Start Managing Your DAO
        </Link>
      </section>

      <section className="relative py-20 px-6 overflow-hidden">
        <AnimatedBackground />
        <h2 className="relative z-10 text-3xl font-bold text-center mb-12">
          Live DAO Stats
        </h2>
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
          {[
            {
              label: "Treasury Balance",
              value: stats.treasury,
              color: "text-indigo-400",
              prefix: "Ξ ",
              suffix: " ETH",
              decimals: 2,
            },
            {
              label: "Your Voting Power",
              value: stats.votes,
              color: "text-green-400",
              suffix: " MGT",
              decimals: 2,
            },
            {
              label: "Total Supply",
              value: stats.supply,
              color: "text-yellow-400",
              suffix: " MGT",
              decimals: 0,
            },
            {
              label: "Proposals",
              value: stats.proposalsCount,
              color: "text-pink-400",
              decimals: 0,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-gray-800/40 border border-white/20 shadow-lg hover:shadow-2xl transition transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
              <p className={`text-2xl font-bold ${item.color}`}>
                <CountUp
                  end={item.value}
                  duration={1.5}
                  decimals={item.decimals}
                  prefix={item.prefix || ""}
                  suffix={item.suffix || ""}
                />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-20 px-6 overflow-hidden">
        <AnimatedBackground />
        <h2 className="relative z-10 text-3xl font-bold text-center mb-12">
          Why Choose DAO AI Governance?
        </h2>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-gray-800/40 border border-white/20 shadow-lg hover:shadow-2xl transition transform hover:scale-105 text-center"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-20 px-6 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <AnimatedBackground />
        <h2 className="relative z-10 text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-6xl mx-auto text-center">
          {[
            {
              title: "Create Proposal",
              img: "https://cdn-icons-png.flaticon.com/512/906/906175.png",
              desc: "AI-assisted creation of proposals.",
            },
            {
              title: "Vote & Delegate",
              img: "https://cdn-icons-png.flaticon.com/512/3607/3607444.png",
              desc: "Vote with insights or delegate effectively.",
            },
            {
              title: "Execute Proposal",
              img: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
              desc: "Smart contract automation for execution.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-gray-800/40 border border-white/20 shadow-lg hover:shadow-2xl transition transform hover:scale-105"
            >
              <img
                src={step.img}
                alt={step.title}
                className="mx-auto mb-4 w-24 h-24 animate-bounce"
              />
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-200">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
