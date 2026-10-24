import type { GeographicBounds, ModelClippingConfig, ProjectConfig, ProjectLayerConfig } from "./types";
import { droneVectors } from "./droneVectors";

// EDIT: illustrative W/S/E/N extent in degrees, not a property boundary.
const bounds: GeographicBounds = [-1, -1, 1, 1];
const basemap: ProjectLayerConfig = {
  id: "basemap", name: "Bing Aerial com rótulos", description: "Bing Maps via Cesium ion", kind: "basemap",
  source: {
    format: "ion-world-imagery",
    fallback: {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      credit: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
      maximumLevel: 19,
    },
  },
  defaultVisible: true,
};

const orthomosaic: ProjectLayerConfig = {
  id: "ortomosaico-rgb",
  name: "Ortomosaico RGB",
  description: "Imagem georreferenciada de Secretário-RJ; não representa uma superfície altimétrica.",
  kind: "orthomosaic",
  group: "raster",
  source: {
    // TMS global-mercator (EPSG:3857 / EPSG:900913), PNG tiles.
    format: "tms",
    url: "https://pub-5226d01507f44d65886b64d1868757d2.r2.dev/orto/{z}/{x}/{reverseY}.png",
    credit: "Secretário-RJ",
    bounds: [-43.41796875, -22.4313401564, -43.24218750, -22.2687640391],
    minimumLevel: 11,
    maximumLevel: 20,
    tileWidth: 256,
    tileHeight: 256,
  },
  defaultVisible: true,
  opacityControl: true,
};

// Thematic imagery only; these rasters do not supply terrain or measurement heights.
const thematicRasterSource = {
  format: "tms" as const,
  credit: "Secretário-RJ",
  bounds: [-43.59375000, -22.59372606, -42.89062500, -21.94304553] as GeographicBounds,
  minimumLevel: 9,
  maximumLevel: 18,
  tileWidth: 256,
  tileHeight: 256,
};

const thematicRasters: ProjectLayerConfig[] = [
  {
    id: "mdt",
    name: "Modelo Digital do Terreno (MDT)",
    description: "Imagem temática do MDT de Secretário-RJ.",
    kind: "dtm",
    group: "raster",
    source: {
      ...thematicRasterSource,
      url: "https://pub-5226d01507f44d65886b64d1868757d2.r2.dev/mdt/{z}/{x}/{reverseY}.png",
    },
    defaultVisible: false,
    opacityControl: true,
  },
  {
    id: "mds",
    name: "Modelo Digital de Superfície (MDS)",
    description: "Imagem temática do MDS de Secretário-RJ.",
    kind: "dsm",
    group: "raster",
    source: {
      ...thematicRasterSource,
      url: "https://pub-5226d01507f44d65886b64d1868757d2.r2.dev/mds/{z}/{x}/{reverseY}.png",
    },
    defaultVisible: false,
    opacityControl: true,
  },
  {
    id: "declividade",
    name: "Declividade",
    description: "Imagem temática de declividade de Secretário-RJ.",
    kind: "slope",
    group: "raster",
    source: {
      ...thematicRasterSource,
      url: "https://pub-5226d01507f44d65886b64d1868757d2.r2.dev/decli/{z}/{x}/{reverseY}.png",
    },
    defaultVisible: false,
    opacityControl: true,
  },
  {
    id: "orientacao-vertentes",
    name: "Orientação das vertentes",
    description: "Imagem temática de orientação das vertentes de Secretário-RJ.",
    kind: "solar-orientation",
    group: "raster",
    source: {
      ...thematicRasterSource,
      url: "https://pub-5226d01507f44d65886b64d1868757d2.r2.dev/aspect/{z}/{x}/{reverseY}.png",
    },
    defaultVisible: false,
    opacityControl: true,
  },
];

// Archived polygon, disabled and never attached to a layer.
export const previousModelClipping: ModelClippingConfig = {
  enabled: false,
  inverse: true,
  positions: [
    [-43.260744482661906, -22.3308118388728],
    [-43.26255495109591, -22.337701422404542],
    [-43.26362907486997, -22.338723254234807],
    [-43.263746716028976, -22.343579789300748],
    [-43.2637004324102, -22.344530887010993],
    [-43.257851732922006, -22.352090974220626],
    [-43.24949586496551, -22.34901951474316],
    [-43.24589585012057, -22.34542606541841],
    [-43.24597508898726, -22.33995940045939],
    [-43.24765116279871, -22.336833138119186],
    [-43.24989026763408, -22.333978820442173],
    [-43.25206111308861, -22.331427525494938],
    [-43.25964730703994, -22.329630962333564],
  ],
};

// Validated six-vertex clipping, always enabled for this model.
const photogrammetricModel: ProjectLayerConfig = {
  id: "modelo-3d-secretario",
  name: "Modelo fotogramétrico 3D",
  description: "Modelo 3D Tiles de Secretário-RJ · Cesium ion 5087714",
  kind: "3d-tiles",
  group: "model",
  source: {
    format: "3d-tiles", source: "ion", assetId: 5087714, tokenEnv: "VITE_CESIUM_3D_TOKEN",
    // Clip this tileset only; keep World Terrain untouched.
    terrainCutout: false,
    clipping: {
      enabled: true,
      inverse: true,
      positions: [
        [-43.25238649481554, -22.33148613203665],
        [-43.25962651102525, -22.329819142852372],
        [-43.26365549346375, -22.343041275837425],
        [-43.25804618955324, -22.351745433753344],
        [-43.247168763865034, -22.347230277715617],
        [-43.246331796573145, -22.339480163034587],
      ],
    },
  },
  defaultVisible: false,
};

// EDIT URLs, bounds, zoom levels, labels and legends, then add the configured
// entries to templateProject.layers. example.invalid is reserved for examples.
// Confirmed edge tile 404/410 errors are recoverable automatically.
export const exampleLayers: ProjectLayerConfig[] = [{
  id: "raster-example-a", name: "Raster A", description: "Descrição do seu raster", kind: "raster",
  source: {
    format: "tms", url: "https://example.invalid/raster-a/{z}/{x}/{reverseY}.png",
    credit: "Seu projeto", bounds, minimumLevel: 0, maximumLevel: 8,
    tileWidth: 256, tileHeight: 256, allowMissingTiles: false,
  },
  defaultVisible: false,
  legend: { type: "image", title: "Raster A", imageUrl: "/legends/example.png", imageAlt: "Legenda ilustrativa; substitua pelos valores do seu raster" },
}, {
  id: "raster-example-b", name: "Raster B", description: "Segundo raster independente", kind: "raster",
  source: {
    format: "tms", url: "https://example.invalid/raster-b/{z}/{x}/{reverseY}.png",
    credit: "Seu projeto", bounds, minimumLevel: 0, maximumLevel: 8,
    tileWidth: 256, tileHeight: 256, allowMissingTiles: false,
  },
  defaultVisible: false,
  legend: { type: "image", title: "Raster B", imageUrl: "/legends/example.png", imageAlt: "Legenda ilustrativa do segundo raster" },
}, {
  id: "vector-example", name: "Vetor", description: "Descrição do seu vetor", kind: "vector",
  source: {
    format: "geojson", url: "https://example.invalid/vector.geojson", autoZoom: false,
    style: { stroke: "#ff0000", strokeWidth: 3, fill: "#00000000", clampToGround: true, zIndex: 1 },
  },
  defaultVisible: false,
}, {
  id: "model-example", name: "Modelo 3D", description: "Descrição do seu modelo", kind: "3d-tiles",
  source: { format: "3d-tiles", source: "url", url: "https://example.invalid/tileset.json" },
  defaultVisible: false,
}];

export const templateProject: ProjectConfig = {
  id: "secretario-rj", name: "Secretário-RJ", location: "Secretário, RJ", bounds,
  // Definitive manually captured view shared by opening and Home.
  // Angles in degrees, height in meters above the ellipsoid.
  initialCamera: {
    longitude: -43.26338767842455,
    latitude: -22.348647087622805,
    height: 1409.6579407470597,
    heading: 42.91259727250432,
    pitch: -32.746673836288835,
    roll: 0.00010292397128315696,
  },
  // Examples are excluded: the stable loader eagerly loads rasters/vectors,
  // even when defaultVisible is false. A fresh clone never requests placeholders.
  layers: [basemap, orthomosaic, ...thematicRasters, photogrammetricModel, ...droneVectors],
  // Optional UI has no data or presets in a fresh template.
  scenes: [],
  diagnostic: { steps: [] },
  // temporalComparison: { left: "configured-period-a", right: "configured-period-b" },
  // Add temporalCampaign to configured XYZ/TMS overlays to show the selector.
  developmentTools: { modelAlignment: false, cameraCapture: false },
};

// Additional v2 examples are deliberately inactive. Replace all placeholders
// before adding them to templateProject.layers. These are synthetic categories.
export const thematicExamples: ProjectLayerConfig[] = [
  {
    id: "areas-example", name: "Áreas temáticas", description: "Classes ilustrativas", kind: "vector", defaultVisible: false, opacityControl: true,
    source: {
      format: "geojson", url: "https://example.invalid/areas.geojson", autoZoom: false, uniqueFeatureIds: true,
      style: {
        stroke: "#32404A", strokeWidth: 3, fill: "#B6C3CF", fillOpacity: 0.35, clampToGround: true, zIndex: 1,
        classification: { property: "class_code", classes: { A: { fill: "#285F9E" }, B: { fill: "#C68524" } } },
        outline: { property: "color_index", colors: ["#285F9E", "#C68524", "#6B4E99"], width: 3, fallbackColor: "#32404A" },
      },
      popup: { title: "Área temática", titleProperty: "label", fields: [
        { property: "size", label: "Área", decimals: 2, suffix: " ha" },
        { property: "value_count", label: "Quantidade", format: "integer" },
        { property: "class_code", label: "Classe", prefix: "Código " },
      ] },
    },
  },
  {
    id: "lines-example", name: "Linhas classificadas", description: "Hierarquia ilustrativa", kind: "vector", defaultVisible: false,
    source: {
      format: "geojson", url: "https://example.invalid/lines.geojson", autoZoom: false, ignoreAltitude: true, uniqueFeatureIds: true,
      style: {
        stroke: "#32404A", strokeWidth: 1, clampToGround: true, zIndex: 10,
        classification: { property: "level_code", classes: {
          minor: { stroke: "#34B3C8", strokeWidth: 1, zIndex: 10 },
          major: { stroke: "#2457B2", strokeWidth: 3.5, zIndex: 11 },
        } },
      },
      popup: { title: "Linha", titleProperty: "label", titlePrefix: "Trecho ", fields: [{ property: "level_code", label: "Classe" }] },
    },
  },
  {
    id: "ion-model-example", name: "Modelo ion", description: "Substitua o assetId ilustrativo", kind: "3d-tiles", defaultVisible: false,
    source: { format: "3d-tiles", source: "ion", assetId: 0, tokenEnv: "VITE_CESIUM_3D_TOKEN", heightOffsetMeters: 0 },
  },
];

// Synthetic polygon near 0°; never use this boundary for a real property.
// Attach to a configured model source only after replacing all coordinates.
export const exampleClipping = {
  enabled: true, inverse: true,
  positions: [[-0.01, -0.01], [0.01, -0.01], [0.01, 0.01], [-0.01, 0.01]] as [number, number][],
};
