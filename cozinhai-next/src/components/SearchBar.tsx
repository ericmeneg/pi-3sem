"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CardProps {
  placeholder: string;
  imgURL: string;
}

export default function SearchBar({
  placeholder,
  imgURL,
}: CardProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/receitas?query=${encodeURIComponent(query)}`);
  };

  return (
    <form
      role="search"
      onSubmit={handleSearch}
      className="flex items-center gap-2 border-2 border-[#22577A] rounded-xl px-2 py-1 sm:min-w-96 inputContainer"
    >
      <input
        aria-label={placeholder}
        className="text-black w-full outline-none font-alexandria text-sm sm:text-base input"
        type="search"
        placeholder={placeholder}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <button
        type="submit"
        aria-label="Buscar receitas"
        className="disabled:opacity-50"
      >
        <Image
          className="w-4 sm:w-5 lupaIcon"
          src={imgURL}
          alt=""
          width={20}
          height={20}
        />
      </button>
    </form>
  );
}
