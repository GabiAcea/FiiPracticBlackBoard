import React from "react";
import OlMapFunction from "../../map/OlMap";
import { Button, Divider } from 'semantic-ui-react';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            layersTiles: [],
        };
    }

    componentDidMount = () => {
        const appMap = new OlMapFunction({
            projectionCode: "EPSG:3857",
            divId: "mapContainer",
            zoom: 3,
            center: [0, 4813697]
        });

        this.appMap = appMap;
        //call openalyer zoomToCurrentLocation after Home component mounted
        this.appMap.zoomToCurrentLocation();
        //get layers from the map via getTileLayers method and set them to a state

        //attach on click map event
        // pass gotAddressResults as  callback method to the attached event
        this.appMap.attachMapEvent();

        this.setState({
            layersTiles: this.appMap.getTileLayers()
        });
    };

    // add method which handles click event and call changeTileLayer method from map with the layer as a parameter
    onclickChangeLayer = (layer) => {
        this.appMap.changeTileLayer(layer.layer);
    };

    gotAddressResults = (addressObj) => {
        //build the address from the provided address object and set it to the input value state via setState
    };

    render() {
        return (
            <div className="home__container">
                <div id="mapContainer" className="home__container-map">
                    <div style={{ display: "none" }}>
                        <div
                            id="marker"
                            className="ui icon"
                            data-position="top center"
                        >
                            <i className="map pin orange icon big" />
                        </div>
                    </div>
                </div>
                <div className="home__container-details">
                    <div className="home__container-actions">
                        <div className="home__container-title">
                            Promote your event
                        </div>
                        <div className="home__container-buttons">
                            <button
                                className="ui labeled icon orange ${
                                    button"
                                onClick={this.onClickCreateEvent}
                            >
                                <i className="plus icon" />
                                Create event
                            </button>
                        </div>
                    </div>

                    <div className="home__container-dashboard">
                    {/* Loop through the layers with map and build the buttons */}
                       <div>
                            {this.state.layersTiles.map((layer, index) => (
                                // Put a name and a click event on button
                                <Button key={index} onClick={() => this.onclickChangeLayer(layer)}>{layer.name}</Button>
                            ))}
                       </div>

                       <Divider hidden />
                       <div className="addresSearchInput">
                           {/*Create a input component from the semantic-ui*/}
                       </div>
                    </div>

                </div>
            </div>
        );
    }
}
