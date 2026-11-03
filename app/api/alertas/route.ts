
import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

// Consultar las alertas
export async function GET() {
  try {
    const [alertas] = await pool.query(`
      SELECT
        id,
        tipo,
        mensaje,
        temperatura,
        estado,
        DATE_FORMAT(fecha_hora, '%Y-%m-%d') AS fecha,
        DATE_FORMAT(fecha_hora, '%H:%i:%s') AS hora
      FROM alertas
      ORDER BY fecha_hora DESC
      LIMIT 200
    `);

    return NextResponse.json(alertas);
  } catch (error) {
    console.error("Error al consultar alertas:", error);

    return NextResponse.json(
      { mensaje: "Error al consultar las alertas" },
      { status: 500 }
    );
  }
}

// Registrar una alerta
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { tipo, mensaje, temperatura, estado } = body;

    const tiposPermitidos = [
      "temperatura_alta",
      "temperatura_baja",
      "desconexion",
    ];

    if (
      !tiposPermitidos.includes(tipo) ||
      typeof mensaje !== "string" ||
      !mensaje.trim()
    ) {
      return NextResponse.json(
        { mensaje: "Los datos de la alerta no son válidos" },
        { status: 400 }
      );
    }

    let temperaturaValidada: number | null = null;

    if (temperatura !== undefined && temperatura !== null) {
      temperaturaValidada = Number(temperatura);

      if (!Number.isFinite(temperaturaValidada)) {
        return NextResponse.json(
          { mensaje: "La temperatura no es válida" },
          { status: 400 }
        );
      }
    }

    const estadoValidado = estado ?? "activa";

    if (!["activa", "atendida"].includes(estadoValidado)) {
      return NextResponse.json(
        { mensaje: "El estado de la alerta no es válido" },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO alertas (tipo, mensaje, temperatura, estado)
       VALUES (?, ?, ?, ?)`,
      [
        tipo,
        mensaje.trim(),
        temperaturaValidada,
        estadoValidado,
      ]
    );

    return NextResponse.json(
      { mensaje: "Alerta guardada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al guardar alerta:", error);

    return NextResponse.json(
      { mensaje: "Error al guardar la alerta" },
      { status: 500 }
    );
  }
}
