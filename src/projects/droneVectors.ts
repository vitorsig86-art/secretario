import type { ProjectLayerConfig } from "./types";

const baseUrl = "https://pub-5226d01507f44d65886b64d1868757d2.r2.dev/geojson";
// Ignore source Z only in the rendering copy. Ground geometry uses Cesium's
// existing clamping to terrain and compatible 3D Tiles, without height offsets.
const source = { format: "geojson" as const, autoZoom: false, ignoreAltitude: true };

export const droneVectors: ProjectLayerConfig[] = [
  {
    id: "perimetro", name: "Perímetro do levantamento", kind: "property-boundary", group: "vector",
    description: "Limite do levantamento. Área horizontal e perímetro calculados geometricamente; não representam área registral.",
    defaultVisible: true,
    source: {
      ...source, url: `${baseUrl}/perimetro.geojson`,
      style: { stroke: "#ff0000", strokeWidth: 3, fill: "#00000000", clampToGround: true, zIndex: 30 },
      popup: { title: "Perímetro do levantamento", calculatedGeometry: true, fields: [] },
    },
  },
  {
    id: "curvas-4m", name: "Curvas de nível — 4 m", kind: "contours", group: "vector",
    description: "Curvas de nível a cada 4 m. Cotas declaradas na fonte entre 576 e 872 m.",
    defaultVisible: false,
    source: {
      ...source, url: `${baseUrl}/curvas_4m.geojson`,
      style: { stroke: "#202020", strokeWidth: 1, clampToGround: true, zIndex: 10 },
      popup: { title: "Curva de nível — 4 m", fields: [
        { property: "ELEVATION", label: "Cota" },
        { property: "CLOSED_CONTOUR", label: "Curva fechada (valor da fonte)" },
      ] },
    },
  },
  {
    id: "drenagem-simulada", name: "Drenagem simulada", kind: "drainage", group: "vector",
    description: "Rede de drenagem simulada, com ordens de Strahler de 1 a 4. Não validada em campo.",
    defaultVisible: false,
    source: {
      ...source, url: `${baseUrl}/drenagem.geojson`,
      style: {
        stroke: "#168bdf", strokeWidth: 1.5, clampToGround: true, zIndex: 20,
        classification: { property: "STRAHLER", classes: {
          "1": { stroke: "#329cdb", strokeWidth: 1.5 },
          "2": { stroke: "#168bdf", strokeWidth: 2.5 },
          "3": { stroke: "#0868c1", strokeWidth: 3.5 },
          "4": { stroke: "#034da1", strokeWidth: 5 },
        } },
      },
      popup: { title: "Drenagem simulada — não validada em campo", fields: [
        { property: "STREAM_ID", label: "Identificador do trecho", format: "integer" },
        { property: "STRAHLER", label: "Ordem de Strahler (adimensional)", format: "integer" },
        { property: "DRAIN_AREA", label: "Área de contribuição (unidade da fonte)" },
        { property: "IN_FLOW", label: "IN_FLOW (unidade não informada na fonte)" },
        { property: "OUT_FLOW", label: "OUT_FLOW (unidade não informada na fonte)" },
      ] },
    },
  },
  {
    id: "microbacias-simuladas", name: "Microbacias simuladas", kind: "vector", group: "vector",
    description: "Microbacias simuladas; conectividade por STREAM_ID e NEXT_STREAM_ID. Carregadas ao ativar a camada.",
    defaultVisible: false, opacityControl: true,
    source: {
      ...source, url: `${baseUrl}/microbacias.geojson`, loadOnDemand: true,
      style: {
        stroke: "#596d74", strokeWidth: 1, fillOpacity: 0.22, clampToGround: true, zIndex: 1,
        colorByProperty: { property: "STREAM_ID", colors: ["#88c9aa", "#8bb8dc", "#c1a0d4", "#e0bd82", "#a5c976", "#df9eac", "#80c9cb", "#bbb0df"] },
      },
      popup: { title: "Microbacia simulada", fields: [
        { property: "STREAM_ID", label: "Identificador da microbacia", format: "integer" },
        { property: "NEXT_STREAM_ID", label: "Próximo trecho / microbacia a jusante", format: "integer" },
        { property: "ENCLOSED_AREA", label: "Área (unidade da fonte)" },
        { property: "PERIMETER", label: "Perímetro (unidade da fonte)" },
      ] },
    },
  },
];
