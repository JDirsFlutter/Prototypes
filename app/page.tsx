import Image from "next/image";
import Link from "next/link";
import { asset } from "@/app/lib/basePath";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full">
        <Image
          src={asset("/brand/pokerstars-logo.svg")}
          alt="PokerStars"
          width={189}
          height={36}
          priority
          className="mb-6"
        />
        <p className="text-ps-small-medium text-ps-grey-60 uppercase tracking-wider mb-3">
          Stars UI Toolkit
        </p>
        <h1 className="text-ps-heading-lg text-ps-black mb-4">
          PokerStars prototypes
        </h1>
        <p className="text-ps-body text-ps-grey-70 mb-10 max-w-lg">
          Workspace for building prototypes against the live brand system. Brand tokens
          are synced from the Figma source of truth and exposed as Tailwind utilities
          (<code className="text-ps-small-bold text-ps-primary-darker">bg-ps-primary</code>,{" "}
          <code className="text-ps-small-bold text-ps-primary-darker">text-ps-heading-lg</code>, …).
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/lobby"
            className="text-ps-body-medium inline-flex items-center justify-center h-12 px-6 rounded-full bg-ps-primary text-ps-black hover:bg-ps-primary-darker hover:text-ps-white transition-colors"
          >
            Tournament lobby
          </Link>
          <Link
            href="/progressive-jackpot"
            className="text-ps-body-medium inline-flex items-center justify-center h-12 px-6 rounded-full bg-ps-black text-ps-white hover:bg-ps-grey-70 transition-colors"
          >
            Royal Jackpot
          </Link>
          <Link
            href="/brand-check"
            className="text-ps-body-medium inline-flex items-center justify-center h-12 px-6 rounded-full bg-ps-grey-10 text-ps-black hover:bg-ps-grey-20 transition-colors"
          >
            Brand check
          </Link>
          <a
            href="https://www.figma.com/design/PWHAQuZxpzMUoTFeVwX1O7/Stars-UI-Toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ps-body-medium inline-flex items-center justify-center h-12 px-6 rounded-full border border-ps-grey-30 text-ps-grey-70 hover:border-ps-grey-50 hover:text-ps-black transition-colors"
          >
            Open Figma source
          </a>
        </div>
      </div>
    </main>
  );
}
