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
        // Skip base layer
        if (layer instanceof TileLayer) return;

        // Handle vector layers
        if (layer instanceof VectorLayer) {
          const title = layer.get("title") || "Untitled Layer";
          const style = layer.getStyle();

          if (style instanceof Style) {
            items.push({
              title,
              color:
                style.getFill()?.getColor() ||
                style.getStroke()?.getColor() ||
                "#ccc",
            });
          } else if (typeof style === "function") {
            // Handle style functions by getting first feature's style
            const source = layer.getSource();
            if (source && source.getFeatures().length > 0) {
              const feature = source.getFeatures()[0];
              const featureStyle = style(feature, 1);
              if (featureStyle) {
                items.push({
                  title,
                  color:
                    featureStyle.getFill()?.getColor() ||
                    featureStyle.getStroke()?.getColor() ||
                    "#ccc",
                });
              }
            }
          }
        }
      });

      setLegendItems(items);
    };

    // Initial extraction
    extractLegendItems();

    // Listen for layer changes
    const layers = map.getLayers();
    layers.on("change:length", extractLegendItems);

    return () => {
      layers.un("change:length", extractLegendItems);
    };
  }, [map]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {legendItems.length > 0 ? (
          legendItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
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
              <span style={{ fontSize: "14px" }}>{item.title}</span>
            </div>
          ))
        ) : (
          <div style={{ color: "#666", fontStyle: "italic", padding: "5px 0" }}>
            No legend items available
          </div>
        )}
      </div>
    </div>
  );
};

export default Legend;
