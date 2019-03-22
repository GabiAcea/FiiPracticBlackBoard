/**
 * The Openlayers map implementation
 */
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile.js";
import WMTS from "ol/source/WMTS.js";
import WMTSTileGrid from "ol/tilegrid/WMTS.js";
import { getWidth, getTopLeft } from "ol/extent.js";
import { get as getProjection, transform, fromLonLat, toLonLat } from "ol/proj";
import Overlay from "ol/Overlay.js";
import { OSM, TileJSON } from "ol/source/";

import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import Style from "ol/style/Style.js";
import Icon from "ol/style/Icon.js";
import SourceVector from "ol/source/Vector.js";
import LayerVector from "ol/layer/Vector.js";

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
    changeTileLayer(layer) {
      //Remove the current layer
      map.getLayers().forEach(function(layerTile) {
        map.removeLayer(layerTile);
      });

      //add the new layer as parameter to the addLayer method
      map.addLayer(layer);
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
    getAddressByCoordonates(lat, long, limit = 1) {
      return new Promise((resolve, reject) => {
        let url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&limit=${limit}`;
        fetch(url)
          .then(response => {
            //get the response promis and pass it as a json promise
            return response.json();
          })
          .then(function(myJson) {
            // resolve with the json value
            resolve(myJson);
          });
      });
    }
    mapClickEventLogic(evt, callback) {
      const getAddressEvent = this.getAddressByCoordonates;
      const coords = toLonLat(evt.coordinate);
      let lat = coords[1];
      let lon = coords[0];

      getAddressEvent(lat, lon).then(response => {
        callback(response);
      });
    }

    removeMapEvent(eventType, callback) {
      map.un(eventType, evt => this.mapClickEventLogic(evt, callback));
    }
    attachMapEvent(eventType, callback) {
      map.on(eventType, evt => this.mapClickEventLogic(evt, callback));
    }

    displayAllEventList(events) {
      //doto add the whole list of events here
      let vectorSource = new SourceVector({});
      var iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
          src: "https://openlayers.org/en/v4.6.5/examples/data/dot.png",
          // src: 'https://scontent.fias1-1.fna.fbcdn.net/v/t1.0-1/c19.0.74.74a/p74x74/22449610_1500673746689021_4551737114276586404_n.jpg?_nc_cat=107&_nc_ht=scontent.fias1-1.fna&oh=583ae280dfac80e3f12c132217c1eeb5&oe=5D112A63',
          color: "red",
          crossOrigin: "anonymous"
        })
      });

      //start loop
      events.forEach(place => {
        var iconFeature = new Feature({
          geometry: new Point(
            transform(
              [place.location.longitude, place.location.latitude],
              "EPSG:4326",
              "EPSG:3857"
            )
          )
        });

        iconFeature.setStyle(iconStyle);
        vectorSource.addFeature(iconFeature);
      });

      var vectorLayer = new LayerVector({
        source: vectorSource,
        updateWhileAnimating: true,
        updateWhileInteracting: true
      });

      map.addLayer(vectorLayer);
    }

    centerMap(long, lat) {
      const coords = fromLonLat([long, lat]);
      view.animate({
        center: this.convertCoordinates(coords, "EPSG:3857", "EPSG:3857"),
        zoom: 15,
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
