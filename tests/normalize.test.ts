import { describe, it, expect } from "vitest";
import { _internal } from "../src/services/normalize";

const { stripHtml, normalizeSource, normalizeDate, normalizeEngagement } =
  _internal;

describe("stripHtml", () => {
  it("membuang tag HTML biasa", () => {
    expect(stripHtml("<p>Hello world</p>")).toBe("Hello world");
  });

  it("membuang script tag beserta isinya (kasus XSS)", () => {
    expect(stripHtml('<p>Aman</p><script>alert(1)</script>')).toBe("Aman");
  });

  it("mengubah entity HTML umum jadi karakter biasa", () => {
    expect(stripHtml("A&nbsp;B &quot;C&quot;")).toBe('A B "C"');
  });
});

describe("normalizeSource", () => {
  it("menyamakan variasi kapitalisasi dan spasi", () => {
    expect(normalizeSource("The Star")).toBe(normalizeSource("thestar"));
    expect(normalizeSource(" malaysiakini ")).toBe(
      normalizeSource("Malaysiakini")
    );
  });
});

describe("normalizeDate", () => {
  it("mem-parse ISO 8601", () => {
    const result = normalizeDate("2026-08-10T08:15:00Z");
    expect(result?.toISOString()).toBe("2026-08-10T08:15:00.000Z");
  });

  it("mem-parse unix timestamp (detik)", () => {
    const result = normalizeDate(1786435200);
    expect(result).toBeInstanceOf(Date);
  });

  it("mem-parse format DD/MM/YYYY tanpa waktu", () => {
    const result = normalizeDate("11/08/2026");
    expect(result?.toISOString().slice(0, 10)).toBe("2026-08-11");
  });

  it("mem-parse format DD/MM/YYYY dengan waktu", () => {
    const result = normalizeDate("11/08/2026 14:30:00");
    expect(result?.toISOString().slice(0, 10)).toBe("2026-08-11");
  });

  it("dua format berbeda untuk tanggal yang sama menghasilkan hari yang sama", () => {
    const a = normalizeDate("11/08/2026");
    const b = normalizeDate("11/08/2026 14:30:00");
    expect(a?.toISOString().slice(0, 10)).toBe(
      b?.toISOString().slice(0, 10)
    );
  });

  it("mengembalikan null untuk input null", () => {
    expect(normalizeDate(null)).toBeNull();
  });

  it("mengembalikan null untuk string yang tidak valid", () => {
    expect(normalizeDate("bukan-tanggal")).toBeNull();
  });
});

describe("normalizeEngagement", () => {
  it("meloloskan number apa adanya", () => {
    expect(normalizeEngagement(412)).toBe(412);
  });

  it("membuang koma dari string angka", () => {
    expect(normalizeEngagement("1,204")).toBe(1204);
  });

  it("fallback ke 0 untuk string yang tidak bisa di-parse", () => {
    expect(normalizeEngagement("bukan-angka")).toBe(0);
  });
});
