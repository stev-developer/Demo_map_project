import React, { useEffect, useState } from "react";
import { Style, Fill, Stroke } from "ol/style";
import { Checkbox, Collapse } from "antd";

const { Panel } = Collapse;

const LayerList = ({ map }) => {
  const [layers, setLayers] = useState([]);
  const [zoneChecked, setZoneChecked] = useState(true);
  const [buildingLayerIndex, setBuildingLayerIndex] = useState(null);
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
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

  console.log(layers, "layers");
  

  const toggleBuildingLayer = () => {
    const index = buildingLayerIndex;
    if (index === null) return;
    const visible = !buildingLayerVisible;

    const updated = [...layers];
    updated[index].visible = visible;
    updated[index].layer.setVisible(visible);
    setBuildingLayerVisible(visible);
    setZoneChecked(updated.every((l) => l.visible));
    setLayers(updated);
  };

  const onChangeBuildingTypes = (checkedValues) => {
    setSelectedTypes(checkedValues);

    if (buildingLayerIndex !== null) {
      const layer = layers[buildingLayerIndex].layer;
      layer.setVisible(checkedValues.length > 0);
      setBuildingLayerVisible(checkedValues.length > 0);
      applyBuildingStyles(checkedValues, layer);
    }
  };

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
      <div>
        <strong>Layer List</strong>

        <div style={{ marginTop: 10 }}>
          <Checkbox checked={zoneChecked} onChange={toggleAllLayers}>
            Zone
          </Checkbox>
        </div>

        <div style={{ marginTop: 10 }}>
          {/* Sort layers by title */}
          {(() => {
            const sortedLayers = [...layers].sort((a, b) =>
              a.title.localeCompare(b.title)
            );
            return (
              <>
                {/* Render each layer */}
                {sortedLayers.map((l, i) => (
                  <div key={i} style={{ marginTop: 5, marginLeft: 20 }}>
                    <Checkbox
                      checked={l.visible}
                      onChange={() => toggleLayerVisibility(i)}
                    >
                      {l.title}
                    </Checkbox>

                    {/* Conditionally render a div if the title contains 'building' */}
                    {l.title.toLowerCase().includes("building") && (
                      <div style={{  marginLeft: 20 }}>
                        {buildingLayerIndex !== null && (
                          <>
                            {buildingTypes.length > 0 &&
                              buildingLayerVisible && (
                                <Checkbox.Group
                                  value={selectedTypes}
                                  onChange={onChangeBuildingTypes}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 5,
                                  }}
                                >
                                  {buildingTypes.map((type) => (
                                    <Checkbox key={type} value={type}>
                                      <span>{type}</span>
                                    </Checkbox>
                                  ))}
                                </Checkbox.Group>
                              )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default LayerList;
