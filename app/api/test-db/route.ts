import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 AS conexion");

    return NextResponse.json({
      mensaje: "Conexión con MySQL exitosa",
      resultado: rows,
    });
  } catch (error) {
    console.error("Error de conexión:", error);

    return NextResponse.json(
      { mensaje: "No se pudo conectar con MySQL" },
      { status: 500 }
    );
  }
}