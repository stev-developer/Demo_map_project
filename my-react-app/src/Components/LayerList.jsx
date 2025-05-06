import React, { useEffect, useState } from "react";
import { Style, Fill, Stroke } from "ol/style";
import { Checkbox } from "antd";

const LayerList = ({ map }) => {
  const [layers, setLayers] = useState([]);
  const [zoneChecked, setZoneChecked] = useState(true);
  const [buildingLayerId, setBuildingLayerId] = useState(null);
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

    const layerData = vectorLayers.map((layer, idx) => {
      const title = layer.get("title") || `Layer ${idx + 1}`;
      const id = layer.ol_uid || `${title}_${idx}`;
      return {
        id,
        title,
        visible: layer.getVisible(),
        layer,
      };
    });

    setLayers(layerData);
    setZoneChecked(layerData.every((l) => l.visible));

    // ✅ Only identify exact building layer
    const buildingLayer = layerData.find(
      (l) => l.title.toLowerCase() === "building"
    );

    if (buildingLayer) {
      const features = buildingLayer.layer.getSource().getFeatures();
      const types = Array.from(
        new Set(features.map((f) => f.get("name")).filter(Boolean))
      );
      setBuildingTypes(types);
      setSelectedTypes(types);
      setBuildingLayerVisible(buildingLayer.visible);
      setBuildingLayerId(buildingLayer.id);
      applyBuildingStyles(types, buildingLayer.layer);
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
    setBuildingLayerVisible(newVal);
  };

  const toggleLayerVisibility = (id) => {
    const updated = layers.map((l) => {
      if (l.id === id) {
        const newVisible = !l.visible;
        l.layer.setVisible(newVisible);

        if (l.id === buildingLayerId) {
          setBuildingLayerVisible(newVisible);
        }

        return { ...l, visible: newVisible };
      }
      return l;
    });

    setLayers(updated);
    setZoneChecked(updated.every((l) => l.visible));
  };

  const onChangeBuildingTypes = (checkedValues) => {
    setSelectedTypes(checkedValues);

    const buildingLayer = layers.find((l) => l.id === buildingLayerId);
    if (buildingLayer) {
      const visible = checkedValues.length > 0;
      buildingLayer.layer.setVisible(visible);
      setBuildingLayerVisible(visible);
      applyBuildingStyles(checkedValues, buildingLayer.layer);
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
        maxWidth: "230px",
        maxHeight: "40vh",
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
          {[...layers]
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((l) => (
              <div key={l.id} style={{ marginTop: 5, marginLeft: 20 }}>
                <Checkbox
                  checked={l.visible}
                  onChange={() => toggleLayerVisibility(l.id)}
                >
                  {l.title}
                </Checkbox>

                {l.id === buildingLayerId && (
                  <div style={{ marginLeft: 20 }}>
                    {buildingTypes.length > 0 && buildingLayerVisible && (
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
                            {type}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LayerList;
