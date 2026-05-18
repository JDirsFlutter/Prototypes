import { psColors } from "@/app/brand/colors";

type Swatch = { name: string; hex: string; textOn?: "light" | "dark" };

const groups: { title: string; swatches: Swatch[] }[] = [
  {
    title: "Brand",
    swatches: [{ name: "Brand Red", hex: psColors.brand.red, textOn: "light" }],
  },
  {
    title: "Primary",
    swatches: [
      { name: "Base",         hex: psColors.primary.base,        textOn: "dark"  },
      { name: "Lighter Alt",  hex: psColors.primary.lighterAlt,  textOn: "dark"  },
      { name: "Lighter",      hex: psColors.primary.lighter,     textOn: "dark"  },
      { name: "Light",        hex: psColors.primary.light,       textOn: "dark"  },
      { name: "Primary",      hex: psColors.primary.primary,     textOn: "dark"  },
      { name: "Darker",       hex: psColors.primary.darker,      textOn: "light" },
    ],
  },
  {
    title: "Greys",
    swatches: [
      { name: "White",   hex: psColors.greys.white,   textOn: "dark"  },
      { name: "Grey 10", hex: psColors.greys.grey10,  textOn: "dark"  },
      { name: "Grey 20", hex: psColors.greys.grey20,  textOn: "dark"  },
      { name: "Grey 30", hex: psColors.greys.grey30,  textOn: "dark"  },
      { name: "Grey 40", hex: psColors.greys.grey40,  textOn: "dark"  },
      { name: "Grey 41", hex: psColors.greys.grey41,  textOn: "dark"  },
      { name: "Grey 50", hex: psColors.greys.grey50,  textOn: "dark"  },
      { name: "Grey 60", hex: psColors.greys.grey60,  textOn: "light" },
      { name: "Grey 69", hex: psColors.greys.grey69,  textOn: "light" },
      { name: "Grey 70", hex: psColors.greys.grey70,  textOn: "light" },
      { name: "Black",   hex: psColors.greys.black,   textOn: "light" },
    ],
  },
  {
    title: "Status",
    swatches: [
      { name: "Success",      hex: psColors.status.success,     textOn: "light" },
      { name: "Success Base", hex: psColors.status.successBase, textOn: "dark"  },
      { name: "Error",        hex: psColors.status.error,       textOn: "light" },
      { name: "Error Base",   hex: psColors.status.errorBase,   textOn: "dark"  },
      { name: "Warning",      hex: psColors.status.warning,     textOn: "light" },
      { name: "Warning Base", hex: psColors.status.warningBase, textOn: "dark"  },
      { name: "Information",  hex: psColors.status.info,        textOn: "light" },
      { name: "Info Base",    hex: psColors.status.infoBase,    textOn: "dark"  },
      { name: "Bonus",        hex: psColors.status.bonus,       textOn: "light" },
      { name: "Bonus Base",   hex: psColors.status.bonusBase,   textOn: "dark"  },
    ],
  },
];

const textStyles = [
  { cls: "text-ps-heading-lg",      label: "Heading / Large (Druk 32/40)" },
  { cls: "text-ps-heading-sm",      label: "Heading / Small (Druk 24/32)" },
  { cls: "text-ps-heading-xs",      label: "Heading / Extra Small (Druk 20/28)" },
  { cls: "text-ps-title-lg",        label: "Title / Large (Roboto 500 20/30)" },
  { cls: "text-ps-title-sm",        label: "Title / Small (Roboto 500 18/28)" },
  { cls: "text-ps-body",            label: "Body / Regular (Roboto 400 16/24)" },
  { cls: "text-ps-body-medium",     label: "Body / Medium (Roboto 500 16/24)" },
  { cls: "text-ps-body-bold",       label: "Body / Bold (Roboto 700 16/24)" },
  { cls: "text-ps-body-link",       label: "Body / Link (Roboto 700 16/24 underline)" },
  { cls: "text-ps-label",           label: "Label / Regular (Roboto 400 15/24)" },
  { cls: "text-ps-small",           label: "Small Body / Regular (Roboto 400 14/20)" },
  { cls: "text-ps-small-medium",    label: "Small Body / Medium (Roboto 500 14/20)" },
  { cls: "text-ps-small-bold",      label: "Small Body / Bold (Roboto 700 14/20)" },
  { cls: "text-ps-small-link",      label: "Small Body / Link (Roboto 700 14/20 underline)" },
  { cls: "text-ps-xsmall",          label: "Extra Small Body / Regular (Roboto 400 12/16)" },
  { cls: "text-ps-xsmall-bold",     label: "Extra Small Body / Bold (Roboto 700 12/16)" },
  { cls: "text-ps-xsmall-link",     label: "Extra Small Body / Link (Roboto 700 12/16 underline)" },
  { cls: "text-ps-numerical",       label: "Title / Numerical Regular (Roboto 400 24/28)" },
  { cls: "text-ps-numerical-medium",label: "Title / Numerical Medium (Roboto 500 24/28)" },
];

export default function BrandCheck() {
  return (
    <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <p className="text-ps-small-medium text-ps-grey-60 uppercase tracking-wider mb-2">
          Verification
        </p>
        <h1 className="text-ps-heading-lg mb-2">Brand check</h1>
        <p className="text-ps-body text-ps-grey-70 max-w-2xl">
          Every colour and text style synced from the Stars UI Toolkit. If anything looks
          off vs the Figma source, the token sync is wrong.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-ps-heading-sm mb-6">Colours</h2>
        {groups.map((g) => (
          <div key={g.title} className="mb-8">
            <h3 className="text-ps-title-sm mb-3 text-ps-grey-70">{g.title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {g.swatches.map((s) => (
                <div
                  key={s.name}
                  className={`rounded-lg p-4 border ${
                    s.hex.toUpperCase() === "#FFFFFF" ? "border-ps-grey-20" : "border-transparent"
                  }`}
                  style={{ background: s.hex }}
                >
                  <div
                    className={`text-ps-body-medium ${
                      s.textOn === "light" ? "text-ps-white" : "text-ps-black"
                    }`}
                  >
                    {s.name}
                  </div>
                  <div
                    className={`text-ps-xsmall mt-1 font-mono ${
                      s.textOn === "light" ? "text-ps-white" : "text-ps-grey-70"
                    }`}
                  >
                    {s.hex}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-ps-heading-sm mb-6">Typography</h2>
        <div className="space-y-4">
          {textStyles.map((t) => (
            <div key={t.cls} className="border-b border-ps-grey-20 pb-3">
              <div className={t.cls}>The quick brown fox jumps over the lazy dog</div>
              <div className="text-ps-xsmall text-ps-grey-60 mt-1 font-mono">{t.label} — <span>{t.cls}</span></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
