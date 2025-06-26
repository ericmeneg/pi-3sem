import Link from "next/link";
import React from "react";

interface botaoProps {
  texto: string;
  destino: string;
  fontSize?: string;
}

export default function Botao({ texto, destino, fontSize }: botaoProps) {
  return (
    <Link
      className="bg-gradient-to-t from-[#22577A] to-[#57CC99] px-6 py-2 rounded-full shadow-md hover:brightness-110 transition inline-flex"
      href={destino}
    >
      <div
        className={`text-white flex flex-row justify-between gap-2 items-center buttonContent`}
        style={fontSize ? { fontSize } : undefined}
      >
        <p>{texto}</p>
        <p>{">"}</p>
      </div>
    </Link>
  );
}
