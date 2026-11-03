
import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

// Consultar la configuración
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        temperatura_min,
        temperatura_max,
        intervalo_medicion,
        duracion_monitoreo,
        fecha_actualizacion
      FROM configuracion
      ORDER BY id ASC
      LIMIT 1`
    );

    const configuraciones = rows as Array<{
      id: number;
      temperatura_min: number;
      temperatura_max: number;
      intervalo_medicion: number;
      duracion_monitoreo: number;
      fecha_actualizacion: Date;
    }>;

    if (configuraciones.length === 0) {
      return NextResponse.json(
        { mensaje: "No hay una configuración registrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(configuraciones[0]);
  } catch (error) {
    console.error("Error al consultar configuración:", error);

    return NextResponse.json(
      { mensaje: "Error al consultar la configuración" },
      { status: 500 }
    );
  }
}

// Actualizar la configuración
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      temperatura_min,
      temperatura_max,
      intervalo_medicion,
      duracion_monitoreo,
    } = body;

    const minimo = Number(temperatura_min);
    const maximo = Number(temperatura_max);
    const intervalo = Number(intervalo_medicion);
    const duracion = Number(duracion_monitoreo);

    if (
      !Number.isFinite(minimo) ||
      !Number.isFinite(maximo) ||
      !Number.isInteger(intervalo) ||
      !Number.isInteger(duracion) ||
      intervalo <= 0 ||
      duracion <= 0 ||
      minimo >= maximo
    ) {
      return NextResponse.json(
        { mensaje: "Los valores de configuración no son válidos" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      "SELECT id FROM configuracion ORDER BY id ASC LIMIT 1"
    );

    const configuraciones = rows as Array<{ id: number }>;

    if (configuraciones.length > 0) {
      await pool.query(
        `UPDATE configuracion
         SET temperatura_min = ?,
             temperatura_max = ?,
             intervalo_medicion = ?,
             duracion_monitoreo = ?
         WHERE id = ?`,
        [
          minimo,
          maximo,
          intervalo,
          duracion,
          configuraciones[0].id,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO configuracion
         (temperatura_min, temperatura_max, intervalo_medicion, duracion_monitoreo)
         VALUES (?, ?, ?, ?)`,
        [minimo, maximo, intervalo, duracion]
      );
    }

    return NextResponse.json({
      mensaje: "Configuración actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);

    return NextResponse.json(
      { mensaje: "Error al actualizar la configuración" },
      { status: 500 }
    );
  }
}
