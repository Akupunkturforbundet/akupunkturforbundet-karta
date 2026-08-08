import { describe, expect, it } from "vitest";
import { practitioners } from "./data/practitioners";
import { filterPractitioners, normalizePostalCode } from "./search";

describe("sökning", () => {
  it("visar alla vid en tom sökning", () => {
    expect(filterPractitioners(practitioners, "")).toHaveLength(practitioners.length);
  });

  it("matchar ort oberoende av skiftläge och mellanslag", () => {
    expect(filterPractitioners(practitioners, "  UPPSALA ")).toHaveLength(2);
  });

  it("hanterar svenska tecken", () => {
    expect(filterPractitioners(practitioners, "Örebro")[0]?.name).toBe("Lena Nyström");
  });

  it("matchar postnummer med och utan mellanslag", () => {
    expect(filterPractitioners(practitioners, "753 12")).toHaveLength(1);
    expect(filterPractitioners(practitioners, "75312")).toHaveLength(1);
  });

  it("matchar början av ett postnummer", () => {
    expect(filterPractitioners(practitioners, "75")).toHaveLength(2);
  });

  it("normaliserar alla blanktecken i postnummer", () => {
    expect(normalizePostalCode(" 753  12 ")).toBe("75312");
  });

  it("matchar hela eller delar av akupunktörens namn", () => {
    expect(filterPractitioners(practitioners, "", "anna")[0]?.name).toBe("Anna Lind");
    expect(filterPractitioners(practitioners, "", "SJÖBERG")[0]?.name).toBe("Erik Sjöberg");
  });

  it("kan kombinera namn och ort", () => {
    expect(filterPractitioners(practitioners, "Stockholm", "Anna")).toHaveLength(1);
    expect(filterPractitioners(practitioners, "Uppsala", "Anna")).toHaveLength(0);
  });
});
