import { Link } from "react-router-dom";
import { PublicFooter, PublicHeader } from "./layout";
import { LEGAL_LINKS, LEGAL_UPDATED_LABEL } from "../lib/constants";

/* A block is a paragraph (string) or a bulleted list (array of strings). */
function LegalBlock({ block }) {
  if (Array.isArray(block)) {
    return (
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-300 marker:text-indigo-400">
        {block.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="mt-3 text-sm leading-7 text-slate-300">{block}</p>;
}

export function LegalPage({ title, intro, sections }) {
  return (
    <div className="min-h-screen" style={{ background: "#08081a" }}>
      <PublicHeader />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-400">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">{intro}</p>
          <p className="mt-3 text-sm text-slate-500">Last updated {LEGAL_UPDATED_LABEL}</p>
        </div>

        <nav aria-label="On this page" className="mb-14 rounded-2xl bg-white/[0.025] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">On this page</p>
          <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-slate-300 transition hover:text-white">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-12">
          {sections.map(({ id, icon: Icon, title: sectionTitle, blocks }, index) => (
            <section key={id} id={id} className="flex scroll-mt-24 gap-5">
              {Icon ? (
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10" aria-hidden="true">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
              ) : null}
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white">
                  {index + 1}. {sectionTitle}
                </h2>
                {blocks.map((block, blockIndex) => (
                  <LegalBlock key={blockIndex} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav aria-label="Other policies" className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.06] pt-8 text-sm">
          {LEGAL_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="text-slate-400 underline-offset-2 transition hover:text-white hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </main>

      <PublicFooter />
    </div>
  );
}
