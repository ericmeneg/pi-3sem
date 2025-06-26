import Link from "next/link";

export default function Footer() {
  return (
    <div className="bg-[#22577A] p-8 md:p-18 gap-12 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/">
          <img
            src="/images/fullLogoWhite.svg"
            className="w-40 md:w-56 hover:brightness-75"
          />
        </Link>

        <div className="flex flex-row gap-4 md:gap-5 items-center">
          {[
            { href: "https://www.tiktok.com", src: "/images/tiktokIcon.svg" },
            { href: "https://www.x.com", src: "/images/twitterIcon.svg" },
            {
              href: "https://www.instagram.com",
              src: "/images/instagramIcon.svg",
            },
            {
              href: "https://www.facebook.com",
              src: "/images/facebookIcon.svg",
            },
          ].map((icon, i) => (
            <Link key={i} href={icon.href} target="_blank">
              <img
                src={icon.src}
                className="w-6 md:w-8 hover:brightness-75 transition"
              />
            </Link>
          ))}
        </div>
      </div>

      <div>
        <ul className="text-white flex flex-col gap-8 m-2.5 text-[20px]">
          <Link href="/" className="hover:underline">
            <li>Início</li>
          </Link>
          <a href="" className="hover:underline">
            <li>Sobre</li>
          </a>
        </ul>
      </div>
    </div>
  );
}
