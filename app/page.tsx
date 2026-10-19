

"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Home,
  Microscope,
  Settings2,
  ShieldAlert,
  Thermometer,
  Wifi,
  ClipboardList,
  ChartNoAxesCombined,
  FlaskConical,
  ChevronRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const demoReadings = [
  { time: "13:00", temp: 35.2 },
  { time: "13:30", temp: 35.8 },
  { time: "14:00", temp: 36.1 },
  { time: "14:30", temp: 35.6 },
  { time: "15:00", temp: 34.9 },
  { time: "15:30", temp: 35.4 },
  { time: "16:00", temp: 36.2 },
  { time: "16:30", temp: 36.7 },
  { time: "17:00", temp: 36.3 },
  { time: "17:30", temp: 35.8 },
  { time: "18:00", temp: 36.5 },
  { time: "18:30", temp: 37.1 },
  { time: "19:00", temp: 36.8 },
];

type ObservationState = "growth" | "no-growth" | "change" | "pending";

const observationOptions: {
  value: ObservationState;
  label: string;
}[] = [
  { value: "growth", label: "Crecimiento observado" },
  { value: "no-growth", label: "Sin crecimiento registrado" },
  { value: "change", label: "Cambio observado" },
  { value: "pending", label: "Observación pendiente" },
];

function BacteriaIllustration({ state }: { state: ObservationState }) {
  const label =
    observationOptions.find((option) => option.value === state)?.label ??
    "Observación pendiente";

  return (
    <svg
      className="bacteria-svg"
      data-observation-state={state}
      viewBox="0 0 360 240"
      role="img"
      aria-label={`${label}. Ilustración conceptual de E. coli, no es una imagen microscópica real.`}
    >
      <defs>
        <linearGradient id="bacteria-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#123c59" />
          <stop offset="50%" stopColor="#10294a" />
          <stop offset="100%" stopColor="#21184b" />
        </linearGradient>
        <linearGradient id="bacteria-core" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity=".16" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity=".22" />
        </linearGradient>
      </defs>

      <g className="bacteria-filaments" aria-hidden="true">
        <path className="bacteria-flagellum" d="M45 91C10 76 20 48 4 38" />
        <path className="bacteria-flagellum" d="M47 145C16 163 30 190 8 204" />
        <path className="bacteria-flagellum" d="M315 93c35-15 25-43 41-53" />
        <path className="bacteria-flagellum" d="M313 146c31 17 17 44 39 59" />
        <path className="bacteria-pilus" d="m86 67-8-20m33 17-1-24m33 24 7-22m39 22 12-20m33 23 17-18m29 25 21-13" />
        <path className="bacteria-pilus" d="m82 172-12 18m45-16-5 23m38-23 4 22m40-22 12 20m34-22 17 17m27-23 20 12" />
      </g>

      <g className="bacteria-cell">
        <path
          className="bacteria-membrane"
          d="M40 120c0-32 22-54 55-54h170c34 0 55 22 55 54s-21 54-55 54H95c-33 0-55-22-55-54Z"
        />
        <path
          className="bacteria-inner-membrane"
          d="M50 120c0-26 18-44 45-44h170c27 0 45 18 45 44s-18 44-45 44H95c-27 0-45-18-45-44Z"
        />
        <path
          className="bacteria-cytoplasm"
          d="M63 120c0-21 15-35 37-35h160c22 0 37 14 37 35s-15 35-37 35H100c-22 0-37-14-37-35Z"
        />
        <path
          className="bacteria-dna"
          d="M101 111c12-21 20 19 32-2s20 19 32-2 20 19 32-2 20 19 32-2 20 19 32-2"
        />
        <circle className="bacteria-plasmid" cx="125" cy="132" r="8" />
        <circle className="bacteria-plasmid" cx="249" cy="106" r="5" />
        <circle className="bacteria-ribosome" cx="91" cy="111" r="2.5" />
        <circle className="bacteria-ribosome" cx="111" cy="143" r="2" />
        <circle className="bacteria-ribosome" cx="151" cy="99" r="2.5" />
        <circle className="bacteria-ribosome" cx="177" cy="140" r="2.5" />
        <circle className="bacteria-ribosome" cx="211" cy="119" r="2" />
        <circle className="bacteria-ribosome" cx="231" cy="139" r="2.5" />
        <circle className="bacteria-ribosome" cx="272" cy="125" r="2" />
      </g>
    </svg>
  );
}

type ViewId =
  | "inicio"
  | "historial"
  | "observaciones"
  | "graficas"
  | "configuracion"
  | "alertas";

type ObservationRecord = {
  id: number;
  result: ObservationState;
  date: string;
  time: string;
  notes: string;
};

const menu: { id: ViewId; name: string; icon: typeof Home }[] = [
  { id: "inicio", name: "Inicio", icon: Home },
  { id: "historial", name: "Historial", icon: ClipboardList },
  { id: "observaciones", name: "Observaciones", icon: Microscope },
  { id: "graficas", name: "Gráficas", icon: ChartNoAxesCombined },
  { id: "configuracion", name: "Configuración", icon: Settings2 },
  { id: "alertas", name: "Alertas", icon: Bell },
];

function NavigationButtons({
  activeView,
  onNavigate,
  demoAlert,
}: {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  demoAlert: boolean;
}) {
  return menu.map(({ id, name, icon: Icon }) => (
    <button
      key={id}
      type="button"
      onClick={() => onNavigate(id)}
      aria-current={activeView === id ? "page" : undefined}
      className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
        activeView === id
          ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-200"
          : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon size={18} />
      {name}
      {id === "alertas" && (
        <span
          className={`ml-auto h-2 w-2 rounded-full ${
            demoAlert ? "bg-rose-400" : "bg-emerald-400"
          }`}
          aria-label={demoAlert ? "Hay alertas de demostración" : "Sin alertas"}
        />
      )}
    </button>
  ));
}

function TemperatureChart({
  minTemp,
  maxTemp,
  expanded = false,
}: {
  minTemp: number;
  maxTemp: number;
  expanded?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-cyan-400/15 bg-[#0a1221]/90 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Historial de temperatura</h3>
          <p className="mt-1 text-xs text-slate-500">
            Datos de demostración · sin lecturas del sensor
          </p>
        </div>
        <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs text-cyan-200">
          °C
        </span>
      </div>

      <div className={`${expanded ? "h-[460px]" : "h-[300px]"} w-full min-w-0`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={demoReadings}
            margin={{ top: 18, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#26354b"
              strokeDasharray="4 5"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#8290a8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[
                Math.min(30, minTemp - 1, ...demoReadings.map((reading) => reading.temp)),
                Math.max(42, maxTemp + 1, ...demoReadings.map((reading) => reading.temp)),
              ]}
              tick={{ fill: "#8290a8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip
              contentStyle={{
                background: "#0b1425",
                border: "1px solid #164e63",
                borderRadius: 12,
              }}
              labelStyle={{ color: "#a5f3fc" }}
              formatter={(value) => [`${value} °C`, "Temperatura de demostración"]}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#22d3ee"
              strokeWidth={3}
              fill="url(#tempFill)"
              dot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#22d3ee" }}
              isAnimationActive
            />
            <ReferenceLine
              y={maxTemp}
              stroke="#fb7185"
              strokeWidth={2}
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
              label={{
                value: `Máximo ${maxTemp} °C`,
                position: "insideTopRight",
                fill: "#fda4af",
                fontSize: 11,
              }}
            />
            <ReferenceLine
              y={minTemp}
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
              label={{
                value: `Mínimo ${minTemp} °C`,
                position: "insideBottomRight",
                fill: "#93c5fd",
                fontSize: 11,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Temperatura
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-blue-400" />
          Límite mínimo
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-rose-400" />
          Límite máximo
        </span>
      </div>
    </div>
  );
}

function ObservationLabel({ state }: { state: ObservationState }) {
  return (
    <>
      {observationOptions.find((option) => option.value === state)?.label ??
        "Observación pendiente"}
    </>
  );
}

export default function HomePage() {
  const [page, setPage] = useState<ViewId>("inicio");
  const [now, setNow] = useState<Date | null>(null);
  const [minTemp, setMinTemp] = useState(35);
  const [maxTemp, setMaxTemp] = useState(39);
  const [minDraft, setMinDraft] = useState("35");
  const [maxDraft, setMaxDraft] = useState("39");
  const [limitMessage, setLimitMessage] = useState("");
  const [observation, setObservation] =
    useState<ObservationState>("pending");
  const [observationDraft, setObservationDraft] =
    useState<ObservationState>("growth");
  const [observationDate, setObservationDate] = useState("");
  const [observationTime, setObservationTime] = useState("");
  const [observationNotes, setObservationNotes] = useState("");
  const [observationRecords, setObservationRecords] = useState<
    ObservationRecord[]
  >([]);
  const [observationMessage, setObservationMessage] = useState("");

  useEffect(() => {
    const update = () => {
      const current = new Date();
      setNow(current);
      setObservationDate((date) => date || localDateValue(current));
      setObservationTime((time) => time || localTimeValue(current));
    };
    update();

    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const demoTemperature = 36.8;
  const demoTemperatureAlert =
    demoTemperature < minTemp || demoTemperature > maxTemp;
  const outOfRangeReadings = demoReadings.filter(
    (reading) => reading.temp < minTemp || reading.temp > maxTemp,
  );
  const date = now
    ? now.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "--";
  const time = now
    ? now.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  const parsedMin = minDraft.trim() === "" ? Number.NaN : Number(minDraft);
  const parsedMax = maxDraft.trim() === "" ? Number.NaN : Number(maxDraft);
  const limitError =
    !Number.isFinite(parsedMin) || !Number.isFinite(parsedMax)
      ? "Ingresa ambos límites con valores numéricos válidos."
      : parsedMin >= parsedMax
        ? "El límite mínimo debe ser menor que el límite máximo."
        : "";

  function saveLimits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (limitError) return;

    setMinTemp(parsedMin);
    setMaxTemp(parsedMax);
    setLimitMessage("Límites actualizados. Las alertas usan datos de demostración.");
  }

  function saveObservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const record: ObservationRecord = {
      id: Date.now(),
      result: observationDraft,
      date: observationDate,
      time: observationTime,
      notes: observationNotes.trim(),
    };

    setObservationRecords((records) => [record, ...records]);
    setObservation(observationDraft);
    setObservationNotes("");
    setObservationMessage("Observación añadida a esta sesión; no se guardará al recargar.");
  }

  const pageTitle =
    page === "inicio"
      ? "Panel principal"
      : menu.find((item) => item.id === page)?.name ?? "Panel principal";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050914] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,173,255,0.10),transparent_35%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.10),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-60 shrink-0 border-r border-cyan-400/10 bg-[#080e1c]/90 p-5 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-400/10 text-cyan-300">
              <Activity size={25} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                E. coli <span className="text-cyan-300">Monitor</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Monitoreo inteligente
              </p>
            </div>
          </div>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Navegación
          </p>
          <nav className="space-y-2" aria-label="Navegación principal">
            <NavigationButtons
              activeView={page}
              onNavigate={setPage}
              demoAlert={outOfRangeReadings.length > 0}
            />
          </nav>

          <div className="mt-auto rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.08] to-violet-500/[0.08] p-4">
            <div className="flex items-center gap-2 text-cyan-300">
              <FlaskConical size={18} />
              <span className="text-sm font-semibold">E. coli K-12</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Monitoreo de temperatura y registro de observaciones manuales.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                SISTEMA DE MONITOREO
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {pageTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Monitoreo de temperatura · E. coli K-12
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                <span className="text-xs text-cyan-100">Modo demostración</span>
              </div>
              <div className="hidden items-center gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="text-xs text-amber-100">
                  ESP32 · Desconectado
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CalendarDays size={14} className="text-cyan-300" />
                  {date}
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-400">
                  <Clock3 size={14} className="text-violet-300" />
                  {time}
                </div>
              </div>
            </div>
          </header>

          <nav
            className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden"
            aria-label="Navegación móvil"
          >
            <NavigationButtons
              activeView={page}
              onNavigate={setPage}
              demoAlert={outOfRangeReadings.length > 0}
            />
          </nav>

          {page === "inicio" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0c1b30] to-[#0a1020] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Temperatura de demostración
                    </span>
                    <Thermometer className="text-cyan-300" size={20} />
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold text-cyan-300">
                      {demoTemperature.toFixed(1)}
                    </span>
                    <span className="mb-1 text-lg text-cyan-200">°C</span>
                  </div>
                  <div
                    className={`mt-3 flex items-center gap-2 text-xs ${
                      demoTemperatureAlert ? "text-rose-300" : "text-emerald-300"
                    }`}
                  >
                    {demoTemperatureAlert ? (
                      <ShieldAlert size={15} />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    {demoTemperatureAlert ? "Fuera del rango" : "Dentro del rango"}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Valor ilustrativo · no es lectura del sensor
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#17142f] to-[#0a1020] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Conexión del sensor
                    </span>
                    <Wifi className="text-amber-300" size={20} />
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-amber-100">
                    Desconectado
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Sin conexión con ESP32
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-[#0c1930] to-[#0a1020] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Medición</span>
                    <Clock3 className="text-blue-300" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-semibold">
                    5 <span className="text-base text-slate-400">min</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Intervalo previsto · demostración
                  </p>
                </div>

                <div className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-[#20132f] to-[#0a1020] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Duración</span>
                    <Database className="text-fuchsia-300" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-semibold">
                    24 <span className="text-base text-slate-400">h</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Periodo previsto
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                <TemperatureChart minTemp={minTemp} maxTemp={maxTemp} />

                <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-violet-400/20 bg-[#0b1021]/90 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">E. coli K-12</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Ilustración conceptual · resultado manual
                      </p>
                    </div>
                    <Microscope className="text-violet-300" size={22} />
                  </div>
                  <div className="relative mt-5 flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_center,rgba(0,120,200,0.15),transparent_70%)]">
                    <div
                      className="absolute h-56 w-56 rounded-full border border-cyan-400/10"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute h-44 w-44 rounded-full border border-violet-400/15 [border-style:dashed]"
                      aria-hidden="true"
                    />
                    <BacteriaIllustration state={observation} />
                  </div>
                  <div className="mt-4 rounded-xl border border-violet-400/15 bg-violet-400/[0.05] p-4">
                    <div className="flex items-center gap-2 text-sm text-violet-200">
                      <Microscope size={16} />
                      Última observación de esta sesión
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      <ObservationLabel state={observation} />
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      El crecimiento no se mide automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0a1221]/90 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Línea de tiempo</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Lecturas de demostración · no son datos reales
                      </p>
                    </div>
                    <Clock3 className="text-cyan-300" size={20} />
                  </div>
                  <div className="space-y-4">
                    {demoReadings.slice(-4).reverse().map((item) => (
                      <div key={item.time} className="flex items-start gap-4">
                        <div className="flex w-12 shrink-0 flex-col items-center">
                          <span className="text-xs text-slate-500">{item.time}</span>
                          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                        </div>
                        <div className="flex-1 border-b border-white/[0.06] pb-3">
                          <p className="text-sm text-slate-200">
                            Lectura de demostración
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.temp.toFixed(1)} °C
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#0a1221]/90 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Alertas</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Derivadas de lecturas disponibles y límites actuales
                      </p>
                    </div>
                    <Bell className="text-violet-300" size={20} />
                  </div>
                  <div
                    className={`rounded-xl border p-4 ${
                      outOfRangeReadings.length
                        ? "border-rose-400/30 bg-rose-400/[0.06]"
                        : "border-emerald-400/20 bg-emerald-400/[0.04]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {outOfRangeReadings.length ? (
                        <ShieldAlert
                          className="mt-0.5 text-rose-300"
                          size={22}
                        />
                      ) : (
                        <CheckCircle2
                          className="mt-0.5 text-emerald-300"
                          size={22}
                        />
                      )}
                      <div>
                        <p className="font-medium text-slate-100">
                          {outOfRangeReadings.length
                            ? `${outOfRangeReadings.length} alerta(s) de demostración`
                            : "Sin alertas en los datos disponibles"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {outOfRangeReadings.length
                            ? "Algunas lecturas de ejemplo están fuera de los límites."
                            : "Las lecturas de ejemplo están dentro de los límites."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage("alertas")}
                    className="mt-4 flex w-full items-center justify-between rounded-xl border border-cyan-400/15 px-4 py-3 text-sm text-cyan-200 transition hover:bg-cyan-400/[0.06]"
                  >
                    Ver todas las alertas <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}

          {page === "historial" && (
            <section className="rounded-2xl border border-cyan-400/15 bg-[#0a1221]/90 p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Historial de mediciones</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Valores fijos de demostración; no son lecturas del ESP32.
                  </p>
                </div>
                <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs text-cyan-200">
                  {demoReadings.length} registros de ejemplo
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-medium">Hora de ejemplo</th>
                      <th className="px-4 py-3 font-medium">Temperatura</th>
                      <th className="px-4 py-3 font-medium">Estado del rango</th>
                      <th className="px-4 py-3 font-medium">Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoReadings.map((reading) => {
                      const isOutOfRange =
                        reading.temp < minTemp || reading.temp > maxTemp;
                      return (
                        <tr
                          key={reading.time}
                          className="border-b border-white/[0.06] text-slate-300 last:border-0"
                        >
                          <td className="px-4 py-3 font-mono text-slate-400">
                            {reading.time}
                          </td>
                          <td className="px-4 py-3 font-medium text-cyan-200">
                            {reading.temp.toFixed(1)} °C
                          </td>
                          <td
                            className={`px-4 py-3 ${
                              isOutOfRange ? "text-rose-300" : "text-emerald-300"
                            }`}
                          >
                            {isOutOfRange ? "Fuera de límites" : "Dentro de límites"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">Demostración</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {page === "observaciones" && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <section className="rounded-2xl border border-violet-400/20 bg-[#0b1021]/90 p-5 sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Microscope className="text-violet-300" size={22} />
                  <div>
                    <h3 className="font-semibold">Nueva observación manual</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      El resultado lo registra el usuario; no lo mide el sistema.
                    </p>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={saveObservation}>
                  <label className="block text-sm text-slate-300">
                    Resultado observado
                    <select
                      required
                      value={observationDraft}
                      onChange={(event) => {
                        const selected = observationOptions.find(
                          (option) => option.value === event.target.value,
                        );
                        if (selected) setObservationDraft(selected.value);
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#050914] px-4 py-3 text-white"
                    >
                      {observationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-slate-300">
                      Fecha
                      <input
                        required
                        type="date"
                        value={observationDate}
                        onChange={(event) => setObservationDate(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#050914] px-4 py-3 text-white"
                      />
                    </label>
                    <label className="block text-sm text-slate-300">
                      Hora
                      <input
                        required
                        type="time"
                        value={observationTime}
                        onChange={(event) => setObservationTime(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#050914] px-4 py-3 text-white"
                      />
                    </label>
                  </div>
                  <label className="block text-sm text-slate-300">
                    Notas
                    <textarea
                      rows={4}
                      value={observationNotes}
                      onChange={(event) => setObservationNotes(event.target.value)}
                      placeholder="Añade detalles relevantes de la observación..."
                      className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#050914] px-4 py-3 text-white placeholder:text-slate-600 focus:border-violet-400 focus:outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-violet-300/30 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-400/20"
                  >
                    Registrar observación
                  </button>
                  {observationMessage && (
                    <p role="status" className="text-xs leading-5 text-cyan-200">
                      {observationMessage}
                    </p>
                  )}
                </form>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-[#0a1221]/90 p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Observaciones de esta sesión</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Se perderán al recargar la página.
                    </p>
                  </div>
                  <span className="rounded-lg border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-xs text-violet-200">
                    {observationRecords.length}
                  </span>
                </div>
                {observationRecords.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                    <Microscope
                      className="mx-auto mb-3 text-slate-600"
                      size={24}
                    />
                    <p className="text-sm text-slate-300">
                      Todavía no hay observaciones registradas.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Usa el formulario para añadir la primera.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {observationRecords.map((record) => (
                      <article
                        key={record.id}
                        className="rounded-xl border border-violet-400/15 bg-violet-400/[0.04] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-violet-100">
                            <ObservationLabel state={record.result} />
                          </p>
                          <time className="text-xs text-slate-500">
                            {record.date} · {record.time}
                          </time>
                        </div>
                        {record.notes ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                            {record.notes}
                          </p>
                        ) : (
                          <p className="mt-3 text-xs text-slate-500">
                            Sin notas adicionales
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {page === "graficas" && (
            <div className="space-y-5">
              <TemperatureChart
                minTemp={minTemp}
                maxTemp={maxTemp}
                expanded
              />
              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4 text-xs leading-5 text-slate-400">
                Vista ampliada de las mismas lecturas de demostración del panel
                principal. Las líneas de límites corresponden a la configuración
                actual; no hay datos reales del sensor conectados.
              </div>
            </div>
          )}

          {page === "configuracion" && (
            <section className="mx-auto max-w-2xl rounded-2xl border border-cyan-400/20 bg-[#0b1425]/90 p-5 sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <Settings2 className="text-cyan-300" size={24} />
                <div>
                  <h3 className="text-lg font-semibold">
                    Límites de temperatura
                  </h3>
                  <p className="text-sm text-slate-400">
                    Define un rango válido para evaluar las lecturas disponibles.
                  </p>
                </div>
              </div>
              <form className="space-y-5" onSubmit={saveLimits} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm text-slate-300">
                    Mínimo (°C)
                    <input
                      type="number"
                      step="any"
                      value={minDraft}
                      aria-invalid={Boolean(limitError)}
                      onChange={(event) => {
                        setMinDraft(event.target.value);
                        setLimitMessage("");
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#050914] px-4 py-3 text-lg outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    Máximo (°C)
                    <input
                      type="number"
                      step="any"
                      value={maxDraft}
                      aria-invalid={Boolean(limitError)}
                      onChange={(event) => {
                        setMaxDraft(event.target.value);
                        setLimitMessage("");
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#050914] px-4 py-3 text-lg outline-none focus:border-cyan-400"
                    />
                  </label>
                </div>
                {limitError && (
                  <p role="alert" className="text-sm text-rose-300">
                    {limitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={Boolean(limitError)}
                  className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Aplicar límites
                </button>
                {limitMessage && (
                  <p role="status" className="text-sm text-cyan-200">
                    {limitMessage}
                  </p>
                )}
              </form>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-300">
                  Estado del valor de demostración ({demoTemperature.toFixed(1)} °C)
                </p>
                <p
                  className={`mt-2 font-medium ${
                    demoTemperatureAlert ? "text-rose-300" : "text-emerald-300"
                  }`}
                >
                  {demoTemperatureAlert
                    ? "Fuera del rango configurado"
                    : "Dentro del rango configurado"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Los límites se aplican a datos de ejemplo, no a una medición real.
                </p>
              </div>
            </section>
          )}

          {page === "alertas" && (
            <section className="rounded-2xl border border-white/[0.08] bg-[#0a1221]/90 p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Alertas por temperatura</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Se generan al comparar las lecturas disponibles con los límites.
                  </p>
                </div>
                <span className="rounded-lg border border-amber-300/15 bg-amber-300/[0.04] px-3 py-1.5 text-xs text-amber-100">
                  Solo datos de demostración
                </span>
              </div>
              {outOfRangeReadings.length === 0 ? (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-8 text-center">
                  <CheckCircle2
                    className="mx-auto mb-3 text-emerald-300"
                    size={26}
                  />
                  <p className="text-sm font-medium text-emerald-100">
                    No hay lecturas fuera de los límites configurados.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Esto solo describe los datos de demostración actuales.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outOfRangeReadings.map((reading) => {
                    const belowMinimum = reading.temp < minTemp;
                    return (
                      <article
                        key={reading.time}
                        className="flex flex-wrap items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-4"
                      >
                        <ShieldAlert
                          className="mt-0.5 shrink-0 text-rose-300"
                          size={20}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-rose-100">
                            Temperatura {belowMinimum ? "bajo el mínimo" : "sobre el máximo"}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {reading.temp.toFixed(1)} °C a las {reading.time} ·
                            límite {belowMinimum ? "mínimo" : "máximo"}{" "}
                            {belowMinimum ? minTemp : maxTemp} °C
                          </p>
                        </div>
                        <span className="rounded-md border border-rose-300/15 px-2 py-1 text-[10px] uppercase tracking-wide text-rose-200">
                          Demostración
                        </span>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className="mt-5 text-xs leading-5 text-slate-500">
                No hay conexión con ESP32 ni una fuente de lecturas reales. Estas
                alertas son resultados calculados al mostrar esta interfaz.
              </p>
            </section>
          )}

          <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] py-5 text-xs text-slate-600">
            <span>E. coli Monitor</span>
            <span className="flex items-center gap-2">
              <Activity size={14} />
              Sistema de monitoreo experimental · modo demostración
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localTimeValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
