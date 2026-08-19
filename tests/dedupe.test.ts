import { describe, it, expect } from "vitest";
import { computeDedupeKey } from "../src/services/dedupe";
import { CleanMention } from "../src/types/mention";

function makeMention(overrides: Partial<CleanMention> = {}): CleanMention {
  return {
    externalId: "ext-1",
    source: "thestar",
    title: "Berita Utama",
    content: "Konten berita",
    url: "https://example.com/1",
    author: "Penulis",
    publishedAt: new Date("2026-08-11T00:00:00.000Z"),
    engagement: 10,
    dedupeKey: "",
    ...overrides,
  };
}

describe("computeDedupeKey", () => {
  it("menghasilkan key yang sama untuk mention yang identik", () => {
    expect(computeDedupeKey(makeMention())).toBe(
      computeDedupeKey(makeMention())
    );
  });

  it("menghasilkan key yang berbeda untuk judul yang berbeda", () => {
    const a = computeDedupeKey(makeMention({ title: "Judul A" }));
    const b = computeDedupeKey(makeMention({ title: "Judul B" }));
    expect(a).not.toBe(b);
  });

  it("menghasilkan key yang berbeda untuk source yang berbeda", () => {
    const a = computeDedupeKey(makeMention({ source: "thestar" }));
    const b = computeDedupeKey(makeMention({ source: "malaysiakini" }));
    expect(a).not.toBe(b);
  });

  it("menghasilkan key yang berbeda untuk tanggal yang berbeda", () => {
    const a = computeDedupeKey(
      makeMention({ publishedAt: new Date("2026-08-11T00:00:00.000Z") })
    );
    const b = computeDedupeKey(
      makeMention({ publishedAt: new Date("2026-08-12T00:00:00.000Z") })
    );
    expect(a).not.toBe(b);
  });

  it("menyamakan variasi kapitalisasi dan spasi pada judul", () => {
    expect(
      computeDedupeKey(makeMention({ title: "  BERITA Utama " }))
    ).toBe(computeDedupeKey(makeMention({ title: "berita utama" })));
  });

  it("key berbentuk hash sha256", () => {
    expect(computeDedupeKey(makeMention())).toMatch(/^[a-f0-9]{64}$/);
  });
});
