// src/components/MapWithGeoJSON.jsx
import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Overlay from "ol/Overlay";
import LayerList from "./LayerList";
import Legend from "./Legend";
import ScaleLine from "ol/control/ScaleLine";

const MapWithGeoJSON = () => {
  const mapContainerRef = useRef();
  const popupRef = useRef();
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Create popup overlay
    const overlay = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });

    // Create scale line control
    const scaleLine = new ScaleLine({
      units: "metric",
      bar: true,
      steps: 4,
      text: true,
      minWidth: 100,
    });

    // Initialize the map
    const mapInstance = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      overlays: [overlay],
      controls: [scaleLine], // Add scale line to map controls
      view: new View({
        center: fromLonLat([80.2082, 12.9703]), // [longitude, latitude]
        zoom: 13,
      }),
    });

    setMap(mapInstance); // Store map instance in state

    const layerConfigs = [
      {
        url: "https://raw.githubusercontent.com/geospatialexplorer/geojson/main/Building.geojson",
        title: "Building",
        color: "rgba(96, 5, 145, 0.58)",
      },
      {
        url: "https://raw.githubusercontent.com/geospatialexplorer/geojson/main/Lake.geojson",
        title: "Lake",
        color: "rgba(0, 255, 247, 0.77)",
      },
      {
        url: "https://raw.githubusercontent.com/geospatialexplorer/geojson/main/Pond.geojson",
        title: "Pond",
        color: "rgba(0,0,255,0.5)",
      },
      {
        url: "https://raw.githubusercontent.com/geospatialexplorer/geojson/main/Road.geojson",
        title: "Road",
        color: "rgba(255, 38, 0, 0.5)",
      },
    ];

    // Load all layers
    layerConfigs.forEach((lyr) => {
      fetch(lyr.url)
        .then((res) => res.json())
        .then((geojson) => {
          const vectorLayer = new VectorLayer({
            source: new VectorSource({
              features: new GeoJSON().readFeatures(geojson, {
                featureProjection: "EPSG:3857",
              }),
            }),
            style: new Style({
              stroke: new Stroke({ color: lyr.color, width: 1 }),
              fill: new Fill({ color: lyr.color }),
            }),
            title: lyr.title,
          });

          mapInstance.addLayer(vectorLayer);
        });
    });

    // Add single popup click handler once
    mapInstance.on("singleclick", function (evt) {
      const feature = mapInstance.forEachFeatureAtPixel(
        evt.pixel,
        (feat) => feat
      );
      if (feature) {
        const props = feature.getProperties();
        const label = props.name || props.Id || "No label";
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
        popupRef.current.innerHTML = `<div style="background:#fff;padding:5px;border:1px solid #ccc;">${label}</div>`;
      } else {
        overlay.setPosition(undefined);
      }
    });

    // Cleanup map on unmount
    return () => {
      mapInstance.setTarget(null);
    };
  }, []);

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
      <div ref={popupRef} className="ol-popup"></div>
      {map && <LayerList map={map} />}
      {map && <Legend map={map} />}
    </div>
  );
};

export default MapWithGeoJSON;
