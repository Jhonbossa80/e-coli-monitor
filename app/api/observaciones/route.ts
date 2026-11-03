
import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

// Consultar observaciones guardadas
export async function GET() {
  try {
    const [observaciones] = await pool.query(`
      SELECT
        id,
        resultado,
        notas,
        DATE_FORMAT(fecha_hora, '%Y-%m-%d') AS fecha,
        DATE_FORMAT(fecha_hora, '%H:%i:%s') AS hora
      FROM observaciones
      ORDER BY fecha_hora DESC
    `);

    return NextResponse.json(observaciones);
  } catch (error) {
    console.error("Error al consultar observaciones:", error);

    return NextResponse.json(
      { mensaje: "Error al consultar las observaciones" },
      { status: 500 }
    );
  }
}

// Guardar una observación
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { resultado, notas, fecha, hora } = body;

    if (!resultado) {
      return NextResponse.json(
        { mensaje: "El resultado de la observación es obligatorio" },
        { status: 400 }
      );
    }

    let fechaHora: string | null = null;

    if (fecha && hora) {
      fechaHora = `${fecha} ${hora}:00`;
    }

    if (fechaHora) {
      await pool.query(
        `INSERT INTO observaciones (resultado, notas, fecha_hora)
         VALUES (?, ?, ?)`,
        [resultado, notas || null, fechaHora]
      );
    } else {
      await pool.query(
        `INSERT INTO observaciones (resultado, notas)
         VALUES (?, ?)`,
        [resultado, notas || null]
      );
    }

    return NextResponse.json({
      mensaje: "Observación guardada correctamente",
    });
  } catch (error) {
    console.error("Error al guardar observación:", error);

    return NextResponse.json(
      { mensaje: "Error al guardar la observación" },
      { status: 500 }
    );
  }
}
