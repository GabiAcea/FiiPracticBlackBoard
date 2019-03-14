import React from "react";
import OlMapFunction from "../../map/OlMap";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount = () => {
        const appMap = new OlMapFunction({
            projectionCode: "EPSG:3857",
            divId: "mapContainer",
            zoom: 3,
            center: [0, 4813697]
        });
        this.appMap = appMap;
    };

    onClickCreateEvent = () => {};

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

                    <div className="home__container-dashboard" />
                </div>
            </div>
        );
    }
}
