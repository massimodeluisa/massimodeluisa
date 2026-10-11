export const FACTS = {
  hhmi: {
    title: "HHMI BioInteractive Virus Explorer, Influenza A",
    url: "https://media.hhmi.org/biointeractive/click/virus-explorer/influenza.html",
    diameterNm: 100,
    genomeBp: 13500,
    segments: 8,
    family: "Orthomyxoviridae",
    steps: ["bind", "endocytosis", "low-pH fusion", "release of genome segments into the cytosol"],
  },
  pr8: {
    strain: "A/Puerto Rico/8/1934 (H1N1)",
    totalNt: 13588,
    citation: "Winter and Fields, Nucleic Acids Research 1982: segment 2 is 2,341 nt and completes the PR8 sequence at 13,588 nt. Per-segment lengths used here are the expected PR8 lengths listed by Keller and colleagues (NS 890, M 1,027, NA 1,413, NP 1,565, HA 1,778, PA 2,233, PB1 and PB2 2,341).",
    segments: [
      { name: "PB2", nt: 2341 },
      { name: "PB1", nt: 2341 },
      { name: "PA", nt: 2233 },
      { name: "HA", nt: 1778 },
      { name: "NP", nt: 1565 },
      { name: "NA", nt: 1413 },
      { name: "M", nt: 1027 },
      { name: "NS", nt: 890 },
    ],
  },
  harris: {
    citation: "Harris et al., PNAS 2006, cryo-ET of X-31 (H3N2). Two fully counted virions carried 301 HA + 50 NA, and 290 HA + 38 NA. Spherical outer diameters ranged 84–170 nm (mean 120). HA tips sit about 14 nm from the membrane; NA tips about 16 nm.",
    counted: [
      { ha: 301, na: 50 },
      { ha: 290, na: 38 },
    ],
    meanDiameterNm: 120,
    diameterRangeNm: [84, 170],
    haTipNm: 14,
    naTipNm: 16,
    rnpLengthNm: [24, 110],
    envelopeMatrixSpacingNm: 5.5,
  },
  zebedee: {
    citation: "Zebedee and Lamb, Journal of Virology 1988: 14–68 M2 molecules per virion, which is 4–17 tetrameric channels.",
    molecules: [14, 68],
    tetramers: [4, 17],
  },
  endosome: {
    citation: "Carter and Iqbal, Viruses 2024, reviewing the endosome: late endosomes span about pH 6.0–4.8. Early endosomes are mildly acidic, near pH 6. The figure's fusion setpoint is pH 5.0, inside that late-endosome window. It is not a claim that every HA subtype springs at 5.0.",
    latePh: [4.8, 6.0],
    earlyPh: 6.2,
    extracellularPh: 7.4,
    fusionSetpoint: 5.0,
    m2OpenBelow: 6.0,
  },
  noda: {
    citation: "Noda et al., Nature 2006: the eight RNPs can pack as one central rod surrounded by seven. Which segment occupies the centre is not fixed here.",
    arrangement: "7+1",
  },
  calder: {
    citation: "Calder et al., and the review in Noda 2011: NA often clusters at the end opposite the RNP attachment, the end where budding pinches off. M2 is too small to place by cryo-ET; a few pores are drawn in that same cap, inside the Zebedee range, as a schematic of that description.",
  },
};
