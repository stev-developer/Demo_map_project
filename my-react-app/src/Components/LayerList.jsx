import React, { useEffect, useState } from "react";
import { Style, Fill, Stroke } from "ol/style";

const LayerList = ({ map }) => {
  const [layers, setLayers] = useState([]);
  const [zoneChecked, setZoneChecked] = useState(true);
  const [buildingLayerIndex, setBuildingLayerIndex] = useState(null);
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [allTypesChecked, setAllTypesChecked] = useState(true);
  const [buildingLayerVisible, setBuildingLayerVisible] = useState(true);

  const getColorForType = (type) => {
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      hash = type.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color =
      "#" +
      ((hash >> 24) & 0xff).toString(16).padStart(2, "0") +
      ((hash >> 16) & 0xff).toString(16).padStart(2, "0") +
      ((hash >> 8) & 0xff).toString(16).padStart(2, "0");
    return color.length === 7 ? color : "#888888";
  };

  const applyBuildingStyles = (types, layer) => {
    layer.setStyle((feature) => {
      const type = feature.get("name");
      if (!types.includes(type)) return null;
      const color = getColorForType(type);
      return new Style({
        fill: new Fill({ color: color + "55" }),
        stroke: new Stroke({ color, width: 2 }),
      });
    });
  };

  useEffect(() => {
    if (!map) return;

    const updateLayers = () => {
      const allLayers = map.getLayers().getArray();
      const vectorLayers = allLayers.filter(
        (layer, idx) => idx > 0 && layer.getSource
      );

      const layerData = vectorLayers.map((layer, idx) => ({
        title: layer.get("title") || `Layer ${idx + 1}`,
        visible: layer.getVisible(),
        layer,
      }));

      setLayers(layerData);
      setZoneChecked(layerData.every((l) => l.visible));

      const buildingIndex = layerData.findIndex((l) =>
        l.title.toLowerCase().includes("building")
      );
      setBuildingLayerIndex(buildingIndex);

      if (buildingIndex !== -1) {
        const buildingLayer = layerData[buildingIndex].layer;
        const features = buildingLayer.getSource().getFeatures();
        const types = Array.from(
          new Set(features.map((f) => f.get("name")).filter(Boolean))
        );
        setBuildingTypes(types);
        setSelectedTypes(types);
        setAllTypesChecked(true);
        setBuildingLayerVisible(buildingLayer.getVisible());
        applyBuildingStyles(types, buildingLayer);
      }
    };

    updateLayers();
    const onAdd = () => updateLayers();
    map.getLayers().on("add", onAdd);
    return () => map.getLayers().un("add", onAdd);
  }, [map]);

  const toggleAllLayers = () => {
    const newVal = !zoneChecked;
    setZoneChecked(newVal);

    const updated = layers.map((l) => {
      l.layer.setVisible(newVal);
      return { ...l, visible: newVal };
    });

    setLayers(updated);
    if (buildingLayerIndex !== null) {
      setBuildingLayerVisible(newVal);
    }
  };

  const toggleLayerVisibility = (index) => {
    const updated = [...layers];
    updated[index].visible = !updated[index].visible;
    updated[index].layer.setVisible(updated[index].visible);
    setLayers(updated);
    setZoneChecked(updated.every((l) => l.visible));

    if (index === buildingLayerIndex) {
      setBuildingLayerVisible(updated[index].visible);
    }
  };

  const toggleBuildingLayer = () => {
    const updated = [...layers];
    const index = buildingLayerIndex;
    if (index === null) return;
    const visible = !buildingLayerVisible;

    updated[index].visible = visible;
    updated[index].layer.setVisible(visible);
    setBuildingLayerVisible(visible);
    setZoneChecked(updated.every((l) => l.visible));
    setLayers(updated);
  };

  const toggleBuildingType = (type) => {
    let updated;
    if (selectedTypes.includes(type)) {
      updated = selectedTypes.filter((t) => t !== type);
    } else {
      updated = [...selectedTypes, type];
    }

    setSelectedTypes(updated);
    setAllTypesChecked(updated.length === buildingTypes.length);

    if (buildingLayerIndex !== null) {
      const layer = layers[buildingLayerIndex].layer;
      layer.setVisible(updated.length > 0);
      setBuildingLayerVisible(updated.length > 0);
      applyBuildingStyles(updated, layer);
    }
  };

  const toggleAllBuildingTypes = () => {
    const newChecked = !allTypesChecked;
    const updated = newChecked ? [...buildingTypes] : [];
    setAllTypesChecked(newChecked);
    setSelectedTypes(updated);

    if (buildingLayerIndex !== null) {
      const layer = layers[buildingLayerIndex].layer;
      layer.setVisible(newChecked);
      setBuildingLayerVisible(newChecked);
      applyBuildingStyles(updated, layer);
    }
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
        maxWidth: "250px",
        fontSize: "14px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        overflowY: "auto",
      }}
    >
      <strong>Layer List</strong>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        <li>
          <label>
            <input
              type="checkbox"
              checked={zoneChecked}
              onChange={toggleAllLayers}
            />{" "}
            Toggle All Layers
          </label>
        </li>

        {layers.map((l, i) => (
          <li key={i}>
            <label>
              <input
                type="checkbox"
                checked={l.visible}
                onChange={() => toggleLayerVisibility(i)}
              />{" "}
              {l.title}
            </label>
          </li>
        ))}

        {buildingLayerIndex !== null && (
          <>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={buildingLayerVisible}
                  onChange={toggleBuildingLayer}
                />{" "}
                Building
              </label>
            </li>
            {buildingTypes.length > 0 && (
              <li>
                <strong>Building Types</strong>
                <ul style={{ listStyle: "none", paddingLeft: "10px" }}>
                  <li key="toggle-all">
                    <label>
                      <input
                        type="checkbox"
                        checked={allTypesChecked}
                        onChange={toggleAllBuildingTypes}
                      />{" "}
                      All Building Types
                    </label>
                  </li>
                  {buildingTypes.map((type, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleBuildingType(type)}
                        />{" "}
                        <span style={{ color: getColorForType(type) }}>
                          {type}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default LayerList;
