// src/components/Legend.jsx
import React, { useEffect, useState } from "react";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

const Legend = ({ map }) => {
  const [legendItems, setLegendItems] = useState([]);

  useEffect(() => {
    if (!map) return;

    const extractLegendItems = () => {
      const items = [];
      const layers = map.getLayers().getArray();

      layers.forEach((layer) => {
        if (layer instanceof TileLayer) return;

        const title = layer.get("title") || "Untitled Layer";

        // Handle Building Layers
        if (title.toLowerCase().includes("building")) {
          const source = layer.getSource();
          if (source) {
            const features = source.getFeatures();
            const typeColorMap = new Map();

            features.forEach((feature) => {
              const name = feature.get("name");
              if (!name) return;

              // Get dynamic style
              const styleFn = layer.getStyle();
              if (typeof styleFn === "function") {
                const style = styleFn(feature, 1);
                const color =
                  style?.getFill()?.getColor() ||
                  style?.getStroke()?.getColor() ||
                  "#ccc";
                typeColorMap.set(name, color);
              }
            });

            typeColorMap.forEach((color, name) => {
              items.push({
                title: name,
                color,
                isBuildingType: true,
              });
            });
          }
        } else if (layer instanceof VectorLayer) {
          // Non-building vector layer style
          const style = layer.getStyle();
          let color = "#ccc";

          if (style instanceof Style) {
            color =
              style.getFill()?.getColor() ||
              style.getStroke()?.getColor() ||
              "#ccc";
          } else if (typeof style === "function") {
            const source = layer.getSource();
            if (source && source.getFeatures().length > 0) {
              const featureStyle = style(source.getFeatures()[0], 1);
              color =
                featureStyle?.getFill()?.getColor() ||
                featureStyle?.getStroke()?.getColor() ||
                "#ccc";
            }
          }

          items.push({
            title,
            color,
            isBuildingType: false,
          });
        }
      });

      setLegendItems(items);
    };

    extractLegendItems();

    // React to layer changes
    const layers = map.getLayers();
    layers.on("change:length", extractLegendItems);
    return () => layers.un("change:length", extractLegendItems);
  }, [map]);

  return (
    <div
      style={{
        
        background: "white",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 1000,
        maxWidth: "250px",
        maxHeight: "50vh",
        overflowY: "auto",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Legend</h3>
      {legendItems.length > 0 ? (
        legendItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: item.color,
                border: "1px solid #999",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "14px" }}>
              {item.isBuildingType ? `🏢 ${item.title}` : item.title}
            </span>
          </div>
        ))
      ) : (
        <div style={{ color: "#666", fontStyle: "italic" }}>
          No legend items available
        </div>
      )}
    </div>
  );
};

export default Legend;
