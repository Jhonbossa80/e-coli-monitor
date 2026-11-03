import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

// Guardar una nueva medición
export async function POST(request: Request) {
  try {
    const datos = await request.json();

    const { temperatura, humedad } = datos;

    if (
      typeof temperatura !== "number" ||
      typeof humedad !== "number" ||
      !Number.isFinite(temperatura) ||
      !Number.isFinite(humedad)
    ) {
      return NextResponse.json(
        { mensaje: "Temperatura o humedad inválidas" },
        { status: 400 }
      );
    }

    const [resultado] = await pool.execute(
      "INSERT INTO mediciones (temperatura, humedad) VALUES (?, ?)",
      [temperatura, humedad]
    );

    return NextResponse.json(
      {
        mensaje: "Medición guardada correctamente",
        resultado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al guardar medición:", error);

    return NextResponse.json(
      { mensaje: "Error al guardar la medición" },
      { status: 500 }
    );
  }
}

// Consultar las mediciones guardadas en MySQL
export async function GET() {
  try {
    const [mediciones] = await pool.query(
      `SELECT
        id,
        temperatura,
        humedad,
        DATE_FORMAT(fecha_hora, '%Y-%m-%d') AS fecha,
        DATE_FORMAT(fecha_hora, '%H:%i:%s') AS hora
      FROM mediciones
      ORDER BY fecha_hora DESC
      LIMIT 200`
    );

    return NextResponse.json(mediciones);
  } catch (error) {
    console.error("Error al consultar mediciones:", error);

    return NextResponse.json(
      { mensaje: "Error al consultar las mediciones" },
      { status: 500 }
    );
  }
}