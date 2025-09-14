export default function Spinner({
  size = "w-12 h-12",
  text = "Loading...",
  color = "border-indigo-600",
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`border-t-4 border-b-4 border-indigo-600 ${color} border-opacity-50 rounded-full animate-spin ${size}`}
      ></div>

      <p className="text-gray-300 text-sm font-medium tracking-wide animate-pulse">
        {text}
      </p>
    </div>
  );
}
