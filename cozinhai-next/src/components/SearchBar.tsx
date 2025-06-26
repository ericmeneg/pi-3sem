"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CardProps {
  placeholder: string;
  imgURL: string;
  searchUrl: string;
}

export default function SearchBar({
  placeholder,
  imgURL,
}: CardProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (!search.trim()) return
    setLoading(true)
    router.push(`/receitas?query=${encodeURIComponent(search)}`)
  }

  return (
    <div
      className={`flex items-center gap-2 border-2 border-[#22577A] rounded-xl px-2 py-1 sm:min-w-96 inputContainer`}
    >
      <input
        className={`text-black w-full outline-none font-alexandria text-sm sm:text-base input`}
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch}
        disabled={loading}
        className="disabled:opacity-50"
      >
        {
          loading ? (<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#22577A]" />
          ) : (
            <img
              className={`w-4 sm:w-5 lupaIcon`}
              src={imgURL}
              alt="Buscar"
            />
          )}
      </button>
    </div>
  );
}
