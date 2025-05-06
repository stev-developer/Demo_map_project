// src/components/LayerList.jsx
import React, { useEffect, useState } from "react";

const LayerList = ({ map }) => {
  const [layers, setLayers] = useState([]);
  const [zoneChecked, setZoneChecked] = useState(true);

  useEffect(() => {
    if (!map) return;

    const updateLayerList = () => {
      const allLayers = map.getLayers().getArray();
      const vectorLayers = allLayers.filter(
        (layer, index) => index > 0 && layer.getSource
      ); // exclude OSM layer

      const layerData = vectorLayers.map((layer, index) => ({
        title: layer.get("title") || `Layer ${index + 1}`,
        visible: layer.getVisible(),
        layer: layer,
      }));

      setLayers(layerData);
      // Set zone checkbox state based on layer visibility
      if (layerData.length > 0) {
        setZoneChecked(layerData.every((layer) => layer.visible));
      }
    };

    updateLayerList(); // Initial call

    // Listen for new layers being added
    const onAddLayer = () => {
      updateLayerList();
    };

    map.getLayers().on("add", onAddLayer);

    return () => {
      map.getLayers().un("add", onAddLayer);
    };
  }, [map]);

  const toggleVisibility = (layerIndex) => {
    const updatedLayers = [...layers];
    const layerInfo = updatedLayers[layerIndex];

    layerInfo.visible = !layerInfo.visible;
    layerInfo.layer.setVisible(layerInfo.visible);
    setLayers(updatedLayers);

    // Update zone checkbox state
    setZoneChecked(updatedLayers.every((layer) => layer.visible));
  };

  const toggleAllLayers = () => {
    const newState = !zoneChecked;
    setZoneChecked(newState);

    const updatedLayers = layers.map((layerInfo) => {
      layerInfo.layer.setVisible(newState);
      return {
        ...layerInfo,
        visible: newState,
      };
    });

    setLayers(updatedLayers);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "white",
        padding: "10px",
        border: "1px solid #ccc",
        zIndex: 1000,
        maxWidth: "200px",
      }}
    >
      <strong>Layer List</strong>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        <li key="zone-toggle" style={{ marginLeft: "-5px" }}>
          <label style={{ fontWeight: "bold" }}>
            <input
              type="checkbox"
              checked={zoneChecked}
              onChange={toggleAllLayers}
            />{" "}
            Zone
          </label>
        </li>
        {layers.map((layerInfo, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={layerInfo.visible}
                onChange={() => toggleVisibility(index)}
              />{" "}
              {layerInfo.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayerList;
