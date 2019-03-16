/**
 * The Openlayers map implementation
 */
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile.js";
import WMTS from "ol/source/WMTS.js";
import WMTSTileGrid from "ol/tilegrid/WMTS.js";
import { getWidth, getTopLeft } from "ol/extent.js";
import { get as getProjection, transform, fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay.js";
import { OSM, TileJSON } from "ol/source/";

let olMap;

export default function OlMapFunction(opts) {
  let map = null;
  let layer = new TileLayer({
    source: new OSM()
  });
  let marker = new Overlay({
    positioning: "center-center",
    stopEvent: false
  });
  let popup = new Overlay({
    positioning: "center-center",
    stopEvent: false
  });
  let view = new View({
    center: opts.center,
    zoom: opts.zoom
  });

  const projection = getProjection(opts.projectionCode);
  const projectionExtent = projection.getExtent();
  const size = getWidth(projectionExtent) / 256;
  const defaultResolutions = new Array(14);
  const defaultMatrixIds = new Array(14);
  for (let z = 0; z < 14; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    defaultResolutions[z] = size / 2 ** z;
    defaultMatrixIds[z] = z;
  }

  const getLayer = (map, id) =>
    map
      .getLayers()
      .getArray()
      .filter(layer => layer.get("layerId") === id)[0];

  class OlMap {
    constructor(options) {
      map = new Map({
        layers: [layer],
        target: options.divId,
        view: view
      });
    }

    addWMTSLayer(
      layerId,
      title,
      dataSource,
      layer,
      imageFormat,
      bounds,
      resolutions,
      matrixIds,
      matrixSet
    ) {
      const wmtsSource = new WMTS({
        crossOrigin: "",
        url: dataSource,
        layer,
        matrixSet,
        format: imageFormat,
        projection,
        tileGrid: new WMTSTileGrid({
          origin: bounds ? getTopLeft(bounds) : getTopLeft(projectionExtent),
          resolutions: resolutions || defaultResolutions,
          matrixIds: matrixIds || defaultMatrixIds
        })
      });

      const options = {
        layerId,
        title,
        source: wmtsSource
      };

      const wmtsLayer = new TileLayer(options);

      map.addLayer(wmtsLayer);
    }

    getTileLayers() {
      const osm = {
        name: "Osm",
        iconName: "shop",
        layer: new TileLayer({ source: new OSM() })
      };
      const bordersTile = {
        name: "Borders",
        iconName: "download",
        layer: new TileLayer({
          source: new TileJSON({
            url:
              "https://api.tiles.mapbox.com/v3/mapbox.world-borders-light.json?secure",
            crossOrigin: "anonymous"
          })
        })
      };
      const geography = {
        name: "Geography",
        iconName: "file",
        layer: new TileLayer({
          source: new TileJSON({
            url:
              "https://api.tiles.mapbox.com/v3/mapbox.geography-class.json?secure",
            crossOrigin: "anonymous"
          })
        })
      };

      return [osm, bordersTile, geography];
    }

    getLayerVisibility(layerId) {
      return getLayer(map, layerId).getVisible();
    }
    setLayerVisibility(layerId, value) {
      return getLayer(map, layerId).setVisible(value);
    }
    addMapEvent(type, handler) {
      return map.on(type, handler);
    }
    convertCoordinates(coords, source, destination) {
      return transform(coords, source, destination);
    }

    changeTileLayer() {
      //Remove the current layer
      map.getLayers().forEach(function(layerTile) {
        map.removeLayer(layerTile);
      });

      //add the new layer as parameter to the addLayer method
      map.addLayer();
    }

    zoomToCurrentLocation() {
      //get current geolocation pozition via navigator
      //after we get the lat/long from response process it with fromLonLat from OpenLayers
      // with the resulted coordonates update the OL view with map.getView().animate();
      // pass duration, center and zoom
      navigator.geolocation.getCurrentPosition(function(pos) {
        const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
        map.getView().animate({
          duration: 3000,
          center: coords,
          zoom: 14
        });
      });
    }

    centerMap(long, lat) {
      const coords = fromLonLat([long, lat]);
      view.animate({
        center: this.convertCoordinates(coords, "EPSG:3857", "EPSG:3857"),
        zoom: 6,
        duration: 1000
      });
    }

    addMarker(long, lat, el) {
      const coords = fromLonLat([long, lat]);
      marker.setElement(el);
      marker.setPosition(coords);
      map.addOverlay(marker);
    }

    addPopup(long, lat, el) {
      const coords = fromLonLat([long, lat]);
      popup.setElement(el);
      popup.setPosition(coords);
      map.addOverlay(popup);
    }

    createOverlay(element, autopan, autopananimation, duration) {
      let overlay;
      if (autopananimation) {
        overlay = new Overlay({
          element: element,
          autoPan: autopan,
          autoPanAnimation: {
            duration: duration
          }
        });
      } else {
        overlay = new Overlay({
          element: element,
          autoPan: autopan
        });
      }
      map.addOverlay(overlay);
      return overlay;
    }
  }
  olMap = new OlMap(opts);
  return olMap;
}
