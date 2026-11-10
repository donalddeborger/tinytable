// Kaartstijl: OpenFreeMap "Positron" (gratis, geen sleutel), aangepast naar
// de zachte TinyTable-kleuren en zonder gebouwen.
import type { StyleSpecification } from "maplibre-gl";

export const BASE_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const MAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> Data van <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

// Lagen die we niet tonen.
const HIDDEN = new Set(["building"]);

// Kleuren per laag (id uit de Positron-stijl).
const COLORS: Record<string, Record<string, string>> = {
  background: { "background-color": "#fbf7f2" },
  park: { "fill-color": "#dff3e6" },
  landcover_wood: { "fill-color": "#d6efdf" },
  landuse_residential: { "fill-color": "#f7f1ea" },
  water: { "fill-color": "#cfe4f6" },
  waterway: { "line-color": "#bcd8ef" },
  road_area_pier: { "fill-color": "#fbf7f2" },
  road_pier: { "line-color": "#fbf7f2" },
  highway_path: { "line-color": "#efe7df" },
  highway_minor: { "line-color": "#ffffff" },
  highway_major_casing: { "line-color": "#eadfd6" },
  highway_major_inner: { "line-color": "#ffffff" },
  highway_motorway_casing: { "line-color": "#e6d9ef" },
  highway_motorway_bridge_casing: { "line-color": "#e6d9ef" },
  tunnel_motorway_casing: { "line-color": "#e6d9ef" },
  railway: { "line-color": "#e2dbe8" },
  railway_transit: { "line-color": "#e2dbe8" },
  railway_service: { "line-color": "#e2dbe8" },
  water_name_point_label: { "text-color": "#4f7aa8" },
  water_name_line_label: { "text-color": "#4f7aa8" },
  "highway-name-minor": { "text-color": "#8a8196" },
  "highway-name-major": { "text-color": "#7a7288" },
  label_other: { "text-color": "#7a7288" },
  label_village: { "text-color": "#3a3150" },
  label_town: { "text-color": "#3a3150" },
  label_city: { "text-color": "#3a3150" },
  label_city_capital: { "text-color": "#3a3150" },
};

export function pastelize(style: StyleSpecification): StyleSpecification {
  const layers = style.layers
    .filter((layer) => !HIDDEN.has(layer.id))
    .map((layer) => {
      const colors = COLORS[layer.id];
      if (!colors || layer.type === "hillshade") return layer;
      return {
        ...layer,
        paint: { ...(("paint" in layer && layer.paint) || {}), ...colors },
      } as typeof layer;
    });
  return { ...style, layers };
}
