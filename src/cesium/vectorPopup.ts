import { Cartographic, ColorMaterialProperty, Ellipsoid, EllipsoidGeodesic, JulianDate, type Entity, type PolygonHierarchy } from "cesium";
import type { VectorPopupConfig } from "../projects/types";
import { geographicArea } from "./measurementUtils";

const configurations = new WeakMap<Entity, VectorPopupConfig>();

export function registerVectorPopup(entity: Entity, config: VectorPopupConfig): void {
  configurations.set(entity, config);
}

// Ground geometry draw order is not consistently reflected in Scene.pick.
// Resolve overlapping configured vectors by their draw priority, leaving
// measurement and other non-vector selection targets untouched.
export function resolveVectorPopupSelection(current: Entity | undefined, candidates: Entity[], time = JulianDate.now()): Entity | undefined {
  if (!current || !configurations.has(current)) return current;
  let selected: Entity | undefined;
  let priority = -Infinity;
  for (const candidate of [current, ...candidates]) {
    if (!configurations.has(candidate) || !candidate.isShowing) continue;
    const graphics = candidate.polyline ?? candidate.polygon;
    const material = graphics?.material;
    if (material instanceof ColorMaterialProperty && material.color?.getValue(time)?.alpha === 0) continue;
    const zIndex = graphics?.zIndex?.getValue(time) ?? 0;
    if (zIndex > priority) {
      selected = candidate;
      priority = zIndex;
    }
  }
  return selected ?? current;
}

function present(value: unknown): boolean {
  return value !== null && value !== undefined && !(typeof value === "number" && !Number.isFinite(value));
}

export function readVectorPopup(entity: Entity | undefined, time = JulianDate.now()) {
  const config = entity && configurations.get(entity);
  if (!config || !entity || !entity.isShowing) return null;
  const properties = entity.properties?.getValue(time) ?? {};
  const titleValue = config.titleProperty ? properties[config.titleProperty] : undefined;
  const geometryFields: { label: string; value: string }[] = [];
  if (config.calculatedGeometry) {
    const hierarchy = (entity.polygon ?? entity.parent?.polygon)?.hierarchy?.getValue(time) as PolygonHierarchy | undefined;
    if (hierarchy) {
      let perimeter = 0;
      const areaOf = (ring: PolygonHierarchy): number => {
        const points = ring.positions;
        for (let i = 0; i < points.length; i++) {
          const start = Cartographic.fromCartesian(points[i], Ellipsoid.WGS84);
          const end = Cartographic.fromCartesian(points[(i + 1) % points.length], Ellipsoid.WGS84);
          if (start.longitude !== end.longitude || start.latitude !== end.latitude) {
            perimeter += new EllipsoidGeodesic(start, end, Ellipsoid.WGS84).surfaceDistance;
          }
        }
        return geographicArea(points) - ring.holes.reduce((sum, hole) => sum + areaOf(hole), 0);
      };
      try {
        const area = areaOf(hierarchy);
        const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
        geometryFields.push(
          { label: "Área horizontal calculada (não registral)", value: `${number.format(area)} m²` },
          { label: "Perímetro calculado", value: `${number.format(perimeter)} m` },
        );
      } catch {
        geometryFields.push({ label: "Geometria calculada", value: "Indisponível para esta geometria" });
      }
    }
  }
  return {
    title: present(titleValue) ? `${config.titlePrefix ?? ""}${titleValue}${config.titleSuffix ?? ""}` : config.title ?? "Informações",
    fields: [...geometryFields, ...config.fields.filter(field => present(properties[field.property])).map(field => {
      const value = properties[field.property];
      const decimals = field.numberFormat?.decimalPlaces ?? (field.format === "integer" ? 0 : field.decimals);
      const formatted = typeof value === "number"
        ? new Intl.NumberFormat(field.numberFormat?.locale ?? "pt-BR", decimals === undefined ? {} : {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        }).format(value)
        : String(value);
      return { label: field.label, value: `${field.prefix ?? ""}${formatted}${field.suffix ?? ""}` };
    })],
  };
}
