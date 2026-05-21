import { useEffect, useState } from "react";
import { CloudRain, Sun, Wind, Droplets, Leaf } from "lucide-react";
import { soundEffects } from "./SoundManager";

interface WeatherData {
  district: string;
  temperature: number;
  condition: string;
  rainForecast: string;
  windSpeed: number;
  humidity: number;
  harvestRecommendation: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weather-info");
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      console.error("Error fetching weather info", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading && !weather) {
    return (
      <div className="bg-emerald-50/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-emerald-100 dark:border-zinc-700 animate-pulse text-center">
        <p className="text-sm text-emerald-800 dark:text-emerald-400">Loading Agronomy Weather Updates...</p>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div id="weather-widget" className="relative bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-2xl border border-emerald-100 dark:border-zinc-700 shadow-sm transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-semibold block">Davanagere Harvest Climate</span>
          <h4 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mt-0.5 flex items-center gap-1.5">
            <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />
            {weather.district}, {weather.temperature}°C
          </h4>
        </div>
        <button 
          onClick={() => { soundEffects.playClick(); fetchWeather(); }}
          className="text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:underline px-2.5 py-1 rounded-full bg-white dark:bg-zinc-700 border border-emerald-200/50 dark:border-zinc-600 transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="bg-white dark:bg-zinc-900/40 p-2.5 rounded-xl border border-emerald-100/50 dark:border-zinc-700 flex flex-col items-center text-center">
          <CloudRain className="h-4.5 w-4.5 text-blue-500 mb-1" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-400">Rain Forecast</span>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate w-full mt-0.5">{weather.rainForecast}</span>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-2.5 rounded-xl border border-emerald-100/50 dark:border-zinc-700 flex flex-col items-center text-center">
          <Wind className="h-4.5 w-4.5 text-amber-600 mb-1" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-400">Wind Speed</span>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 mt-0.5">{weather.windSpeed} km/h</span>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-2.5 rounded-xl border border-emerald-100/50 dark:border-zinc-700 flex flex-col items-center text-center">
          <Droplets className="h-4.5 w-4.5 text-teal-500 mb-1" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-400">Humidity</span>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 mt-0.5">{weather.humidity}%</span>
        </div>
      </div>

      <div className="bg-emerald-800/5 dark:bg-emerald-900/15 p-3 rounded-xl border border-emerald-800/10 dark:border-emerald-800/20 flex gap-2.5 items-start">
        <div className="p-1 rounded-lg bg-emerald-700 text-white mt-0.5">
          <Leaf className="h-3.5 w-3.5" />
        </div>
        <div>
          <h5 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Agronomic Advisory</h5>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
            {weather.harvestRecommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
