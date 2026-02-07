interface HealthTipProps {
  aqi: number;
}

export default function HealthTip({ aqi }: HealthTipProps) {
  const getAdvice = (value: number) => {
    if (value <= 50)
      return {
        text: "Air quality is excellent. Perfect conditions for outdoor activities.",
        action: "Enjoy the fresh air! 🏃‍♂️",
        color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      };
    if (value <= 100)
      return {
        text: "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.",
        action: "Safe for most. 👍",
        color: "text-teal-400 border-teal-500/20 bg-teal-500/10",
      };
    if (value <= 200)
      return {
        text: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
        action: "Wear a mask if sensitive. 😷",
        color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
      };
    if (value <= 300)
      return {
        text: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
        action: "Avoid long runs. Wear a mask. ⚠️",
        color: "text-orange-400 border-orange-500/20 bg-orange-500/10",
      };
    if (value <= 400)
      return {
        text: "Health warnings of emergency conditions. The entire population is more likely to be affected.",
        action: "Stay indoors. Close windows. 🚫",
        color: "text-red-400 border-red-500/20 bg-red-500/10",
      };
    return {
      text: "Health alert: everyone may experience more serious health effects.",
      action: "DANGER. Do not go outside. ☠️",
      color: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    };
  };

  const advice = getAdvice(aqi);

  return (
    <div
      className={`mt-6 p-4 rounded-xl border ${advice.color} backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-1">💡</div>
        <div>
          <h4 className="font-bold text-lg mb-1">{advice.action}</h4>
          <p className="text-sm opacity-90 leading-relaxed">{advice.text}</p>
        </div>
      </div>
    </div>
  );
}
