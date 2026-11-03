

"use client";

import { useEffect, useRef, useState } from "react";
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

type TemperatureReading = {
  id: number | string;
  date: string;
  time: string;
  temp: number;
  humidity: number | null;
};

type ObservationState = "growth" | "no-growth" | "change" | "pending";
type AlertType = "temperatura_alta" | "temperatura_baja" | "desconexion";
type AlertStatus = "activa" | "atendida";
type ApiResource =
  | "mediciones"
  | "observaciones"
  | "alertas"
  | "configuracion";

type AlertRecord = {
  id: number | string;
  tipo: AlertType;
  mensaje: string;
  temperatura: number | null;
  estado: AlertStatus;
  fecha: string;
  hora: string;
};

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
          <stop offset="0%" stopColor="#8bdcff" />
          <stop offset="50%" stopColor="#b8edff" />
          <stop offset="100%" stopColor="#d5f4ff" />
        </linearGradient>
        <linearGradient id="bacteria-core" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284c7" stopOpacity=".16" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity=".22" />
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
  id: number | string;
  result: ObservationState;
  date: string;
  time: string;
  notes: string;
};

class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function requestJson(
  url: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await fetch(url, { cache: "no-store", ...init });
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta no válida.");
  }

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.mensaje === "string"
        ? body.mensaje
        : `La solicitud falló (HTTP ${response.status}).`;
    throw new ApiRequestError(message, response.status);
  }

  return body;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isObservationState(value: unknown): value is ObservationState {
  return observationOptions.some((option) => option.value === value);
}

function isAlertType(value: unknown): value is AlertType {
  return (
    value === "temperatura_alta" ||
    value === "temperatura_baja" ||
    value === "desconexion"
  );
}

function isAlertStatus(value: unknown): value is AlertStatus {
  return value === "activa" || value === "atendida";
}

function parseApiRows<T>(
  value: unknown,
  parseRow: (row: unknown) => T | null,
): T[] {
  if (!Array.isArray(value)) {
    throw new Error("El servidor devolvió una lista no válida.");
  }

  const rows: T[] = [];
  for (const row of value) {
    const parsedRow = parseRow(row);
    if (parsedRow === null) {
      throw new Error("El servidor devolvió un registro no válido.");
    }
    rows.push(parsedRow);
  }
  return rows;
}

function formatDatabaseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString("es-CO");
}

function parseMeasurement(value: unknown): TemperatureReading | null {
  if (!isRecord(value)) return null;

  const id = Number(value.id);
  const temp = Number(value.temperatura);
  const humidity =
    value.humedad === null ? null : Number(value.humedad);

  if (
    !Number.isSafeInteger(id) ||
    !Number.isFinite(temp) ||
    (humidity !== null && !Number.isFinite(humidity)) ||
    typeof value.fecha !== "string" ||
    typeof value.hora !== "string"
  ) {
    return null;
  }

  return {
    id,
    date: formatDatabaseDate(value.fecha),
    time: value.hora,
    temp,
    humidity,
  };
}

function parseObservation(value: unknown): ObservationRecord | null {
  if (
    !isRecord(value) ||
    !isObservationState(value.resultado) ||
    typeof value.fecha !== "string" ||
    typeof value.hora !== "string"
  ) {
    return null;
  }

  const id = Number(value.id);
  if (!Number.isSafeInteger(id)) return null;

  return {
    id,
    result: value.resultado,
    date: formatDatabaseDate(value.fecha),
    time: value.hora,
    notes: typeof value.notas === "string" ? value.notas : "",
  };
}

function parseAlert(value: unknown): AlertRecord | null {
  if (!isRecord(value)) return null;

  const id = Number(value.id);
  const temperature =
    value.temperatura === null ? null : Number(value.temperatura);

  if (
    !Number.isSafeInteger(id) ||
    !isAlertType(value.tipo) ||
    !isAlertStatus(value.estado) ||
    typeof value.mensaje !== "string" ||
    (temperature !== null && !Number.isFinite(temperature)) ||
    typeof value.fecha !== "string" ||
    typeof value.hora !== "string"
  ) {
    return null;
  }

  return {
    id,
    tipo: value.tipo,
    mensaje: value.mensaje,
    temperatura: temperature,
    estado: value.estado,
    fecha: formatDatabaseDate(value.fecha),
    hora: value.hora,
  };
}

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
  hasAlert,
}: {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  hasAlert: boolean;
}) {
  return menu.map(({ id, name, icon: Icon }) => (
    <button
      key={id}
      type="button"
      onClick={() => onNavigate(id)}
      aria-current={activeView === id ? "page" : undefined}
      className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
        activeView === id
          ? "border-cyan-400/25 bg-sky-100/80 text-sky-700"
          : "border-transparent text-slate-600 hover:bg-white/80 hover:text-slate-900"
      }`}
    >
      <Icon size={18} />
      {name}
      {id === "alertas" && (
        <span
          className={`ml-auto h-2 w-2 rounded-full ${
            hasAlert ? "bg-rose-400" : "bg-emerald-400"
          }`}
          aria-label={hasAlert ? "Hay alertas de temperatura" : "Sin alertas"}
        />
      )}
    </button>
  ));
}

function TemperatureChart({
  minTemp,
  maxTemp,
  readings,
  expanded = false,
}: {
  minTemp: number;
  maxTemp: number;
  readings: TemperatureReading[];
  expanded?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-sky-300/60 bg-white/85 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Historial de temperatura</h3>
          <p className="mt-1 text-xs text-slate-600">
            Lecturas recibidas desde el ESP32
          </p>
        </div>
        <span className="rounded-lg border border-sky-300/70 bg-sky-100/80 px-3 py-1.5 text-xs text-sky-700">
          °C
        </span>
      </div>

      <div className={`${expanded ? "h-[460px]" : "h-[300px]"} relative w-full min-w-0`}>
        {readings.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-dashed border-sky-200/80 bg-white/70 px-6 text-center text-sm text-slate-600">
            Conecta el ESP32 para comenzar a registrar lecturas reales.
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={readings}
            margin={{ top: 18, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#0284c7" stopOpacity={0.01} />
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
                Math.min(30, minTemp - 1, ...readings.map((reading) => reading.temp)),
                Math.max(42, maxTemp + 1, ...readings.map((reading) => reading.temp)),
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
              formatter={(value) => [`${value} °C`, "Temperatura"]}
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

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
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
  const [measurementInterval, setMeasurementInterval] = useState(60);
  const [monitoringDuration, setMonitoringDuration] = useState(24);
  const [intervalDraft, setIntervalDraft] = useState("60");
  const [durationDraft, setDurationDraft] = useState("24");
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
  const [realTemperature, setRealTemperature] = useState<number | null>(null);
  const [realHumidity, setRealHumidity] = useState<number | null>(null);
  const [realReadings, setRealReadings] = useState<TemperatureReading[]>([]);
  const [alertRecords, setAlertRecords] = useState<AlertRecord[]>([]);
  const [apiErrors, setApiErrors] = useState<
    Partial<Record<ApiResource, string>>
  >({});
  const [isSavingObservation, setIsSavingObservation] = useState(false);
  const [isSavingConfiguration, setIsSavingConfiguration] = useState(false);
  const [serialStatus, setSerialStatus] = useState("Desconectado");
  const activeTemperatureAlert = useRef<AlertType | null>(null);
  const limitsRef = useRef({ min: 35, max: 39 });

  function reportApiFailure(resource: ApiResource, message: string) {
    setApiErrors((errors) => ({ ...errors, [resource]: message }));
  }

  function clearApiFailure(resource: ApiResource) {
    setApiErrors((errors) => {
      if (!(resource in errors)) return errors;
      const nextErrors = { ...errors };
      delete nextErrors[resource];
      return nextErrors;
    });
  }

  function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? `${fallback}: ${error.message}` : fallback;
  }

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

  useEffect(() => {
    let isCurrent = true;

    async function loadMeasurements() {
      try {
        const body = await requestJson("/api/mediciones");
        const readings = parseApiRows(body, parseMeasurement).reverse();
        if (!isCurrent) return;

        setRealReadings(readings);
        const latest = readings.at(-1);
        setRealTemperature(latest?.temp ?? null);
        setRealHumidity(latest?.humidity ?? null);
        clearApiFailure("mediciones");
      } catch (error) {
        if (isCurrent) {
          reportApiFailure(
            "mediciones",
            getErrorMessage(error, "No se pudieron cargar las mediciones"),
          );
        }
      }
    }

    async function loadObservations() {
      try {
        const body = await requestJson("/api/observaciones");
        const records = parseApiRows(body, parseObservation);
        if (!isCurrent) return;

        setObservationRecords(records);
        setObservation(records[0]?.result ?? "pending");
        clearApiFailure("observaciones");
      } catch (error) {
        if (isCurrent) {
          reportApiFailure(
            "observaciones",
            getErrorMessage(error, "No se pudieron cargar las observaciones"),
          );
        }
      }
    }

    async function loadAlerts() {
      try {
        const body = await requestJson("/api/alertas");
        const records = parseApiRows(body, parseAlert);
        if (!isCurrent) return;

        setAlertRecords(records);
        clearApiFailure("alertas");
      } catch (error) {
        if (isCurrent) {
          reportApiFailure(
            "alertas",
            getErrorMessage(error, "No se pudieron cargar las alertas"),
          );
        }
      }
    }

    async function loadConfiguration() {
      try {
        const body = await requestJson("/api/configuracion");
        if (!isRecord(body)) {
          throw new Error("La configuración recibida no es válida.");
        }

        const minimum = Number(body.temperatura_min);
        const maximum = Number(body.temperatura_max);
        const measurementInterval = Number(body.intervalo_medicion);
        const monitoringDuration = Number(body.duracion_monitoreo);

        if (
          !Number.isFinite(minimum) ||
          !Number.isFinite(maximum) ||
          minimum >= maximum ||
          !Number.isInteger(measurementInterval) ||
          measurementInterval <= 0 ||
          !Number.isInteger(monitoringDuration) ||
          monitoringDuration <= 0
        ) {
          throw new Error("La configuración guardada contiene valores inválidos.");
        }
        if (!isCurrent) return;

        setMinTemp(minimum);
        setMaxTemp(maximum);
        setMinDraft(String(minimum));
        setMaxDraft(String(maximum));
        setMeasurementInterval(measurementInterval);
        setMonitoringDuration(monitoringDuration);
        setIntervalDraft(String(measurementInterval));
        setDurationDraft(String(monitoringDuration));
        limitsRef.current = { min: minimum, max: maximum };
        clearApiFailure("configuracion");
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          clearApiFailure("configuracion");
          return;
        }
        if (isCurrent) {
          reportApiFailure(
            "configuracion",
            getErrorMessage(error, "No se pudo cargar la configuración"),
          );
        }
      }
    }

    void Promise.all([
      loadMeasurements(),
      loadObservations(),
      loadAlerts(),
      loadConfiguration(),
    ]);

    return () => {
      isCurrent = false;
    };
  }, []);

  const hasRealReading = realTemperature !== null;
  const temperatureAlert =
    realTemperature !== null &&
    (realTemperature < minTemp || realTemperature > maxTemp);

  async function saveMeasurement(temperatura: number, humedad: number) {
    try {
      await requestJson("/api/mediciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temperatura, humedad }),
      });
      clearApiFailure("mediciones");
    } catch (error) {
      reportApiFailure(
        "mediciones",
        getErrorMessage(error, "No se pudo guardar la medición"),
      );
    }
  }

  async function saveAlert(
    tipo: AlertType,
    mensaje: string,
    temperatura: number | null,
  ) {
    try {
      await requestJson("/api/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          mensaje,
          temperatura,
          estado: "activa",
        }),
      });

      const recordedAt = new Date();
      const record: AlertRecord = {
        id: `local-${recordedAt.getTime()}-${Math.random()}`,
        tipo,
        mensaje,
        temperatura,
        estado: "activa",
        fecha: recordedAt.toLocaleDateString("es-CO"),
        hora: recordedAt.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
      setAlertRecords((records) => [record, ...records]);
      clearApiFailure("alertas");
    } catch (error) {
      reportApiFailure(
        "alertas",
        getErrorMessage(error, "No se pudo guardar la alerta"),
      );
    }
  }

  async function connectESP32() {
    let connected = false;

    try {
      if (!("serial" in navigator)) {
        alert("Tu navegador no soporta conexión serial. Usa Microsoft Edge o Google Chrome.");
        return;
      }

      setSerialStatus("Conectando...");

      // @ts-expect-error Web Serial API puede no estar incluida en los tipos del proyecto
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      connected = true;
      setSerialStatus("Conectado");

      const reader = port.readable.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            let data: unknown;
            try {
              data = JSON.parse(cleanLine);
            } catch {
              continue;
            }

            if (!isRecord(data)) continue;

            const temperature =
              typeof data.temperatura === "number" &&
              Number.isFinite(data.temperatura)
                ? data.temperatura
                : null;
            const humidity =
              typeof data.humedad === "number" &&
              Number.isFinite(data.humedad)
                ? data.humedad
                : null;

            if (temperature !== null) {
              const receivedAt = new Date();
              const reading: TemperatureReading = {
                id: receivedAt.getTime(),
                date: receivedAt.toLocaleDateString("es-CO"),
                time: receivedAt.toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
                temp: temperature,
                humidity,
              };

              setRealTemperature(temperature);
              if (humidity !== null) {
                setRealHumidity(humidity);
                void saveMeasurement(temperature, humidity);
              }
              setRealReadings((records) => [...records, reading].slice(-200));

              const { min, max } = limitsRef.current;
              if (temperature > max) {
                if (activeTemperatureAlert.current !== "temperatura_alta") {
                  activeTemperatureAlert.current = "temperatura_alta";
                  void saveAlert(
                    "temperatura_alta",
                    `Temperatura por encima del límite máximo (${max} °C).`,
                    temperature,
                  );
                }
              } else if (temperature < min) {
                if (activeTemperatureAlert.current !== "temperatura_baja") {
                  activeTemperatureAlert.current = "temperatura_baja";
                  void saveAlert(
                    "temperatura_baja",
                    `Temperatura por debajo del límite mínimo (${min} °C).`,
                    temperature,
                  );
                }
              } else {
                activeTemperatureAlert.current = null;
              }
            }

            if (humidity !== null) setRealHumidity(humidity);
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Error al conectar con ESP32:", error);
      if (!connected) {
        alert("No se pudo conectar al ESP32. Verifica que Thonny esté detenido y vuelve a intentarlo.");
      }
    } finally {
      setSerialStatus("Desconectado");
      if (connected) {
        activeTemperatureAlert.current = null;
        void saveAlert("desconexion", "El ESP32 se ha desconectado.", null);
      }
    }
  }
  const outOfRangeReadings = realReadings.filter(
    (reading) => reading.temp < minTemp || reading.temp > maxTemp,
  );
  const activeAlerts = alertRecords.filter((alert) => alert.estado === "activa");
  const visibleApiErrors = Object.values(apiErrors).filter(
    (message): message is string => Boolean(message),
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
  const parsedInterval =
    intervalDraft.trim() === "" ? Number.NaN : Number(intervalDraft);
  const parsedDuration =
    durationDraft.trim() === "" ? Number.NaN : Number(durationDraft);
  const limitError =
    !Number.isFinite(parsedMin) || !Number.isFinite(parsedMax)
      ? "Ingresa ambos límites con valores numéricos válidos."
      : parsedMin >= parsedMax
        ? "El límite mínimo debe ser menor que el límite máximo."
        : !Number.isInteger(parsedInterval) || parsedInterval <= 0
          ? "El intervalo debe ser un número entero mayor que cero."
          : !Number.isInteger(parsedDuration) || parsedDuration <= 0
            ? "La duración debe ser un número entero mayor que cero."
            : "";

  async function saveLimits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (limitError) return;

    setIsSavingConfiguration(true);
    try {
      await requestJson("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperatura_min: parsedMin,
          temperatura_max: parsedMax,
          intervalo_medicion: parsedInterval,
          duracion_monitoreo: parsedDuration,
        }),
      });

      setMinTemp(parsedMin);
      setMaxTemp(parsedMax);
      setMeasurementInterval(parsedInterval);
      setMonitoringDuration(parsedDuration);
      limitsRef.current = { min: parsedMin, max: parsedMax };
      setLimitMessage(
        "Configuración guardada. El intervalo se almacena en MySQL y no cambia automáticamente el ESP32.",
      );
      clearApiFailure("configuracion");
    } catch (error) {
      reportApiFailure(
        "configuracion",
        getErrorMessage(error, "No se pudo guardar la configuración"),
      );
      setLimitMessage("");
    } finally {
      setIsSavingConfiguration(false);
    }
  }

  async function saveObservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingObservation(true);
    try {
      await requestJson("/api/observaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultado: observationDraft,
          notas: observationNotes.trim(),
          fecha: observationDate,
          hora: observationTime,
        }),
      });

      const record: ObservationRecord = {
        id: `local-${Date.now()}`,
        result: observationDraft,
        date: observationDate,
        time: observationTime,
        notes: observationNotes.trim(),
      };
      setObservationRecords((records) => [record, ...records]);
      setObservation(observationDraft);
      setObservationNotes("");
      setObservationMessage("Observación guardada en MySQL.");
      clearApiFailure("observaciones");
    } catch (error) {
      reportApiFailure(
        "observaciones",
        getErrorMessage(error, "No se pudo guardar la observación"),
      );
      setObservationMessage("No se pudo guardar la observación. Revisa la conexión e inténtalo de nuevo.");
    } finally {
      setIsSavingObservation(false);
    }
  }

  const pageTitle =
    page === "inicio"
      ? "Panel principal"
      : menu.find((item) => item.id === page)?.name ?? "Panel principal";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eaf7ff] text-slate-800">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.25),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.18),transparent_40%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-60 shrink-0 border-r border-sky-200/70 bg-white/85 p-5 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-300/90 bg-sky-100/80 text-sky-700">
              <Activity size={25} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                E. coli <span className="text-sky-700">Monitor</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600">
                Monitoreo inteligente
              </p>
            </div>
          </div>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Navegación
          </p>
          <nav className="space-y-2" aria-label="Navegación principal">
            <NavigationButtons
              activeView={page}
              onNavigate={setPage}
              hasAlert={activeAlerts.length > 0 || outOfRangeReadings.length > 0}
            />
          </nav>

          <div className="mt-auto rounded-2xl border border-sky-300/60 bg-gradient-to-br from-sky-100/70 to-sky-100/70 p-4">
            <div className="flex items-center gap-2 text-sky-700">
              <FlaskConical size={18} />
              <span className="text-sm font-semibold">E. coli K-12</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Monitoreo de temperatura y registro de observaciones manuales.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                SISTEMA DE MONITOREO
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {pageTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Monitoreo de temperatura · E. coli K-12
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="text-xs text-amber-800">
                  ESP32 · {serialStatus}
                </span>
              </div>
              <div className="rounded-xl border border-sky-200/80 bg-white/75 px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CalendarDays size={14} className="text-sky-700" />
                  {date}
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-600">
                  <Clock3 size={14} className="text-blue-700" />
                  {time}
                </div>
              </div>
            </div>
          </header>

          {visibleApiErrors.length > 0 && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              <p className="font-medium">Algunos datos no pudieron sincronizarse con MySQL.</p>
              <ul className="mt-1 list-inside list-disc text-xs leading-5">
                {visibleApiErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <nav
            className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden"
            aria-label="Navegación móvil"
          >
            <NavigationButtons
              activeView={page}
              onNavigate={setPage}
              hasAlert={activeAlerts.length > 0 || outOfRangeReadings.length > 0}
            />
          </nav>

          {page === "inicio" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-sky-300/70 bg-gradient-to-br from-sky-100 to-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Temperatura actual
                    </span>
                    <Thermometer className="text-sky-700" size={20} />
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold text-sky-700">
                      {hasRealReading ? realTemperature!.toFixed(1) : "--"}
                    </span>
                    <span className="mb-1 text-lg text-sky-700">°C</span>
                  </div>
                  <div
                    className={`mt-3 flex items-center gap-2 text-xs ${
                      temperatureAlert ? "text-rose-700" : hasRealReading ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {temperatureAlert ? (
                      <ShieldAlert size={15} />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    {!hasRealReading ? "Esperando lectura" : temperatureAlert ? "Fuera del rango" : "Dentro del rango"}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-600">
                    {hasRealReading
                      ? "Lectura recibida desde el ESP32"
                      : "Esperando lectura del sensor"}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-100 to-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Conexión del sensor
                    </span>
                    <Wifi
                      className={serialStatus === "Conectado" ? "text-emerald-700" : "text-amber-500"}
                      size={20}
                    />
                  </div>
                  <div className={`mt-4 text-2xl font-semibold ${serialStatus === "Conectado" ? "text-emerald-800" : "text-sky-800"}`}>
                    {serialStatus}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {realHumidity !== null ? `Humedad: ${realHumidity}%` : "Esperando datos del sensor"}
                  </p>
                  <button
                    type="button"
                    onClick={connectESP32}
                    className="mt-3 w-full rounded-xl border border-sky-300/80 bg-sky-100/80 px-4 py-3 text-sm font-medium text-sky-800 transition hover:bg-sky-200/80"
                  >
                    Conectar ESP32
                  </button>
                </div>

                <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-sky-100 to-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Medición</span>
                    <Clock3 className="text-blue-700" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-semibold">
                    {measurementInterval}{" "}
                    <span className="text-base text-slate-600">s</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">
                    Intervalo configurado · no modifica automáticamente el ESP32
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-100 to-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Duración</span>
                    <Database className="text-sky-700" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-semibold">
                    {monitoringDuration}{" "}
                    <span className="text-base text-slate-600">h</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">
                    Periodo previsto
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                <TemperatureChart minTemp={minTemp} maxTemp={maxTemp} readings={realReadings} />

                <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-200/80 bg-white/85 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">E. coli K-12</h3>
                      <p className="mt-1 text-xs text-slate-600">
                        Ilustración conceptual · resultado manual
                      </p>
                    </div>
                    <Microscope className="text-blue-700" size={22} />
                  </div>
                  <div className="relative mt-5 flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_70%)]">
                    <div
                      className="absolute h-56 w-56 rounded-full border border-sky-200/70"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute h-44 w-44 rounded-full border border-blue-200/70 [border-style:dashed]"
                      aria-hidden="true"
                    />
                    <BacteriaIllustration state={observation} />
                  </div>
                  <div className="mt-4 rounded-xl border border-blue-200/70 bg-blue-100/70 p-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Microscope size={16} />
                      Última observación de esta sesión
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      <ObservationLabel state={observation} />
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      El crecimiento no se mide automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-sky-200/80 bg-white/85 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Línea de tiempo</h3>
                      <p className="mt-1 text-xs text-slate-600">
                        Últimas lecturas recibidas desde el ESP32
                      </p>
                    </div>
                    <Clock3 className="text-sky-700" size={20} />
                  </div>
                  <div className="space-y-4">
                    {realReadings.length === 0 && (
                      <p className="rounded-xl border border-dashed border-sky-200/80 p-5 text-center text-sm text-slate-600">
                        Aún no hay lecturas. Conecta el ESP32 para comenzar.
                      </p>
                    )}
                    {realReadings.slice(-4).reverse().map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
                        <div className="flex w-12 shrink-0 flex-col items-center">
                          <span className="text-xs text-slate-600">{item.time}</span>
                          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.25)]" />
                        </div>
                        <div className="flex-1 border-b border-sky-200/70 pb-3">
                          <p className="text-sm text-slate-700">
                            Lectura del sensor · {item.date}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {item.temp.toFixed(1)} °C{item.humidity !== null ? ` · ${item.humidity}% HR` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-200/80 bg-white/85 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Alertas</h3>
                      <p className="mt-1 text-xs text-slate-600">
                        Derivadas de lecturas disponibles y límites actuales
                      </p>
                    </div>
                    <Bell className="text-blue-700" size={20} />
                  </div>
                  <div
                    className={`rounded-xl border p-4 ${
                      outOfRangeReadings.length
                        ? "border-rose-400/30 bg-rose-400/[0.06]"
                        : "border-emerald-200/80 bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {outOfRangeReadings.length ? (
                        <ShieldAlert
                          className="mt-0.5 text-rose-700"
                          size={22}
                        />
                      ) : realReadings.length === 0 ? (
                        <Clock3 className="mt-0.5 text-slate-500" size={22} />
                      ) : (
                        <CheckCircle2
                          className="mt-0.5 text-emerald-700"
                          size={22}
                        />
                      )}
                      <div>
                        <p className="font-medium text-slate-800">
                          {outOfRangeReadings.length
                            ? `${outOfRangeReadings.length} alerta(s) de temperatura`
                            : realReadings.length === 0 ? "Esperando lecturas del sensor" : "Sin alertas en los datos disponibles"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-600">
                          {outOfRangeReadings.length
                            ? "Hay lecturas reales del sensor fuera de los límites configurados."
                            : realReadings.length === 0
                              ? "Conecta el ESP32 para empezar a recibir mediciones."
                              : "Todas las lecturas recibidas están dentro de los límites configurados."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage("alertas")}
                    className="mt-4 flex w-full items-center justify-between rounded-xl border border-sky-300/60 px-4 py-3 text-sm text-sky-700 transition hover:bg-sky-100/80"
                  >
                    Ver todas las alertas <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}

          {page === "historial" && (
            <section className="rounded-2xl border border-sky-300/60 bg-white/85 p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Historial de mediciones</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Mediciones guardadas recibidas desde el ESP32.
                  </p>
                </div>
                <span className="rounded-lg border border-sky-300/70 bg-sky-100/80 px-3 py-1.5 text-xs text-sky-700">
                  {realReadings.length} lecturas
                </span>
              </div>
              {realReadings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-sky-200/80 px-4 py-10 text-center text-sm text-slate-600">
                  Todavía no hay mediciones. Conecta el ESP32 para llenar el historial.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-sky-200/80 text-xs uppercase tracking-wide text-slate-600">
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 font-medium">Hora</th>
                        <th className="px-4 py-3 font-medium">Temperatura</th>
                        <th className="px-4 py-3 font-medium">Humedad</th>
                        <th className="px-4 py-3 font-medium">Estado del rango</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...realReadings].reverse().map((reading) => {
                        const isOutOfRange = reading.temp < minTemp || reading.temp > maxTemp;
                        return (
                          <tr key={reading.id} className="border-b border-sky-200/70 text-slate-700 last:border-0">
                            <td className="px-4 py-3 text-slate-600">{reading.date}</td>
                            <td className="px-4 py-3 font-mono text-slate-600">{reading.time}</td>
                            <td className="px-4 py-3 font-medium text-sky-700">{reading.temp.toFixed(1)} °C</td>
                            <td className="px-4 py-3 text-slate-600">{reading.humidity !== null ? `${reading.humidity}%` : "—"}</td>
                            <td className={`px-4 py-3 ${isOutOfRange ? "text-rose-700" : "text-emerald-700"}`}>
                              {isOutOfRange ? "Fuera de límites" : "Dentro de límites"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {page === "observaciones" && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <section className="rounded-2xl border border-blue-200/80 bg-white/85 p-5 sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Microscope className="text-blue-700" size={22} />
                  <div>
                    <h3 className="font-semibold">Nueva observación manual</h3>
                    <p className="mt-1 text-xs text-slate-600">
                      El resultado lo registra el usuario; no lo mide el sistema.
                    </p>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={saveObservation}>
                  <label className="block text-sm text-slate-700">
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
                      className="mt-2 w-full rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-slate-900"
                    >
                      {observationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-slate-700">
                      Fecha
                      <input
                        required
                        type="date"
                        value={observationDate}
                        onChange={(event) => setObservationDate(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-slate-900"
                      />
                    </label>
                    <label className="block text-sm text-slate-700">
                      Hora
                      <input
                        required
                        type="time"
                        value={observationTime}
                        onChange={(event) => setObservationTime(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-slate-900"
                      />
                    </label>
                  </div>
                  <label className="block text-sm text-slate-700">
                    Notas
                    <textarea
                      rows={4}
                      value={observationNotes}
                      onChange={(event) => setObservationNotes(event.target.value)}
                      placeholder="Añade detalles relevantes de la observación..."
                      className="mt-2 w-full resize-y rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSavingObservation}
                    className="w-full rounded-xl border border-violet-300/30 bg-blue-100/80 px-4 py-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
                  >
                    {isSavingObservation ? "Guardando..." : "Registrar observación"}
                  </button>
                  {observationMessage && (
                    <p
                      role="status"
                      className={`text-xs leading-5 ${
                        observationMessage.startsWith("No se pudo")
                          ? "text-rose-700"
                          : "text-sky-700"
                      }`}
                    >
                      {observationMessage}
                    </p>
                  )}
                </form>
              </section>

              <section className="rounded-2xl border border-sky-200/80 bg-white/85 p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Observaciones guardadas</h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Observaciones guardadas en MySQL.
                    </p>
                  </div>
                  <span className="rounded-lg border border-blue-200/80 bg-blue-100/70 px-3 py-1.5 text-xs text-blue-700">
                    {observationRecords.length}
                  </span>
                </div>
                {observationRecords.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-sky-200/80 px-4 py-10 text-center">
                    <Microscope
                      className="mx-auto mb-3 text-slate-600"
                      size={24}
                    />
                    <p className="text-sm text-slate-700">
                      Todavía no hay observaciones registradas.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Usa el formulario para añadir la primera.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {observationRecords.map((record) => (
                      <article
                        key={record.id}
                        className="rounded-xl border border-blue-200/70 bg-blue-100/60 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-blue-800">
                            <ObservationLabel state={record.result} />
                          </p>
                          <time className="text-xs text-slate-600">
                            {record.date} · {record.time}
                          </time>
                        </div>
                        {record.notes ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {record.notes}
                          </p>
                        ) : (
                          <p className="mt-3 text-xs text-slate-600">
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
                readings={realReadings}
                expanded
              />
              <div className="rounded-xl border border-sky-200/70 bg-sky-100/60 p-4 text-xs leading-5 text-slate-600">
                Vista ampliada de las lecturas recibidas durante esta sesión. Las líneas de límites corresponden a la configuración actual.
              </div>
            </div>
          )}

          {page === "configuracion" && (
            <section className="mx-auto max-w-2xl rounded-2xl border border-sky-300/70 bg-white/85 p-5 sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <Settings2 className="text-sky-700" size={24} />
                <div>
                  <h3 className="text-lg font-semibold">
                    Límites de temperatura
                  </h3>
                  <p className="text-sm text-slate-600">
                    Define un rango válido para evaluar las lecturas disponibles.
                  </p>
                </div>
              </div>
              <form className="space-y-5" onSubmit={saveLimits} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm text-slate-700">
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
                      className="mt-2 w-full rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-lg outline-none focus:border-sky-500"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
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
                      className="mt-2 w-full rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-lg outline-none focus:border-sky-500"
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm text-slate-700">
                    Intervalo de medición (segundos)
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={intervalDraft}
                      aria-invalid={Boolean(limitError)}
                      onChange={(event) => {
                        setIntervalDraft(event.target.value);
                        setLimitMessage("");
                      }}
                      className="mt-2 w-full rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-lg outline-none focus:border-sky-500"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Duración del monitoreo (horas)
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={durationDraft}
                      aria-invalid={Boolean(limitError)}
                      onChange={(event) => {
                        setDurationDraft(event.target.value);
                        setLimitMessage("");
                      }}
                      className="mt-2 w-full rounded-xl border border-sky-200/80 bg-[#eaf7ff] px-4 py-3 text-lg outline-none focus:border-sky-500"
                    />
                  </label>
                </div>
                {limitError && (
                  <p role="alert" className="text-sm text-rose-700">
                    {limitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={Boolean(limitError) || isSavingConfiguration}
                  className="rounded-xl border border-sky-300/80 bg-sky-100/80 px-5 py-3 text-sm font-medium text-sky-800 transition hover:bg-sky-200/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSavingConfiguration ? "Guardando..." : "Guardar configuración"}
                </button>
                {limitMessage && (
                  <p role="status" className="text-sm text-sky-700">
                    {limitMessage}
                  </p>
                )}
              </form>
              <div className="mt-5 rounded-xl border border-sky-200/80 bg-white/75 p-4">
                <p className="text-sm text-slate-700">
                  Estado de temperatura ({hasRealReading ? realTemperature!.toFixed(1) : "--"} °C)
                </p>
                <p
                  className={`mt-2 font-medium ${
                    temperatureAlert ? "text-rose-700" : hasRealReading ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {!hasRealReading
                    ? "Esperando lectura del sensor"
                    : temperatureAlert
                      ? "Fuera del rango configurado"
                      : "Dentro del rango configurado"}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {hasRealReading ? "Los límites se aplican a las lecturas recibidas del ESP32." : "Los límites se evaluarán cuando llegue la primera lectura real."}
                </p>
              </div>
            </section>
          )}

          {page === "alertas" && (
            <section className="rounded-2xl border border-sky-200/80 bg-white/85 p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Alertas guardadas</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Alertas de temperatura y desconexiones registradas.
                  </p>
                </div>
                <span className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                  {activeAlerts.length} activas · {alertRecords.length} total
                </span>
              </div>
              {alertRecords.length === 0 ? (
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-8 text-center">
                  <CheckCircle2
                    className="mx-auto mb-3 text-emerald-700"
                    size={26}
                  />
                  <p className="text-sm font-medium text-emerald-800">
                    No hay alertas guardadas.
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Las alertas aparecerán aquí al detectar temperaturas fuera de rango o una desconexión del ESP32.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertRecords.map((alertRecord) => {
                    const temperatureType =
                      alertRecord.tipo === "temperatura_alta" ||
                      alertRecord.tipo === "temperatura_baja";
                    return (
                      <article
                        key={alertRecord.id}
                        className="flex flex-wrap items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50 p-4"
                      >
                        <ShieldAlert
                          className="mt-0.5 shrink-0 text-rose-700"
                          size={20}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-rose-800">
                            {alertRecord.tipo === "temperatura_alta"
                              ? "Temperatura alta"
                              : alertRecord.tipo === "temperatura_baja"
                                ? "Temperatura baja"
                                : "Desconexión del ESP32"}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {alertRecord.mensaje}
                            {temperatureType && alertRecord.temperatura !== null
                              ? ` · ${alertRecord.temperatura.toFixed(1)} °C`
                              : ""}
                            {" · "}{alertRecord.fecha} a las {alertRecord.hora}
                          </p>
                        </div>
                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-wide ${
                            alertRecord.estado === "activa"
                              ? "border-rose-300/30 text-rose-700"
                              : "border-slate-300/50 text-slate-600"
                          }`}
                        >
                          {alertRecord.estado}
                        </span>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className="mt-5 text-xs leading-5 text-slate-600">
                Una alerta de temperatura se registra al entrar en un rango fuera de límites y no se repite por cada lectura mientras continúe esa condición.
              </p>
            </section>
          )}

          <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-sky-200/80 py-5 text-xs text-slate-600">
            <span>E. coli Monitor</span>
            <span className="flex items-center gap-2">
              <Activity size={14} />
              Sistema de monitoreo experimental · lecturas del sensor
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
