import React from "react";
import moment from "moment";
import { DatetimePickerTrigger } from "rc-datetime-picker";
import OlMapFunction from "../../map/OlMap";
import { Button, Input, Divider, Transition, Search, Select, Icon } from 'semantic-ui-react';
import { categoryOptions } from "../../utils/utils";
import firebaseProvider from "../../config/FireConfig";
import HereConfig from "../../config/HereConfig";
import "es6-promise";
import "isomorphic-fetch";
import "fetch-jsonp-polyfill";

//components
import EventItem from "../../components/homeScreen/eventItem";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        const shortcuts = {
            Today: moment(),
            Tomorrow: moment().add(1, "days")
        };

        this.state = {
            layersTiles: [],
            isFetching: false,
            isFetchingSearch: false,
            locationOptions: [],
            categoryOptions: categoryOptions,
            moment: moment(),
            formState: {
                title: "",
                organizer: "",
                description: "",
                location: {
                    id: "",
                    title: ""
                },
                date: {
                    day: "",
                    month: "",
                    entireDate: ""
                },
                category: ""
            },
            eventList: [],
            scheduledEvents: [],
            eventListVisible: true,
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

        //display all events on the map
        this.displayEventsOnMaps();

        this.setState({
            layersTiles: this.appMap.getTileLayers()
        });
    };

    onClickEvent = (event, index) => {
        const { location } = event;
        this.setState({
            activeIndex: index
        });
        
        this.appMap.centerMap(location.longitude, location.latitude);
    };

    //animation logic between create event and events list
    onClickCreateEvent = () => {
        //TODO attach map click event and pass the address process function 
        this.appMap.attachMapEvent("click", this.gotAddressResults);
        this.setState({
            eventListVisible: false
        });
    };

    onCompleteCreateEvent = () => {
        this.setState({
            createEventVisible: true
        });
    };

    displayEventsOnMaps = () => {
        //get all events
        this.initializeEventList().then((resp) => {
            //it returns the vectorLayer with the events
            this.appMap.displayAllEventList(resp);
        });
    }

    initializeEventList = () => {
        return new Promise((resolve) => {
            firebaseProvider
                .database()
                .ref("events")
                .on("value", (rsp) => {
                    const eventsArray = [];

                    rsp.forEach((elem) => {
                        eventsArray.push(elem.val());
                    });

                    this.setState({
                        eventList: eventsArray
                    });

                    resolve(eventsArray);
                });
        });
    };

    handleInputChange = ev => {
        // Update form elements
        this.setState({
            formState: {
                ...this.state.formState,
                [ ev.target.name]:  ev.target.value
              }
        });
    }

    onClickBackToEventList = () => {
        this.setState(
            {
                createEventVisible: false,
                suggestionForLocation: "",
                formState: {
                    title: "",
                    organizer: "",
                    description: "",
                    location: {
                      id: "",
                      title: ""
                    },
                    date: {
                      day: "",
                      month: "",
                      entireDate: ""
                    },
                    category: ""
                  }
            },
        );
    };

    onCompleteBackToEventList = () => {
        //TODO remove map click event so it would not be triggered wile clicking the map
        this.appMap.removeMapEvent("click", this.gotAddressResults);

        this.setState({
            eventListVisible: true
        });
    };

    // add method which handles click event and call changeTileLayer method from map with the layer as a parameter
    onclickChangeLayer = (layer) => {
        // also add the current event layer
        this.appMap.changeTileLayer(layer.layer);
        //TODO also add the current events layer
    };

    setNewEvent = (event, userId) => {
        return firebaseProvider
        .database()
        .ref("events")
        .push()
        .set(event)
    };

    handleSaveEvent = () => {
        const payload = {
            userId: localStorage.getItem("userId"),
            title: this.state.formState.title,
            organizer: this.state.formState.organizer,
            description: this.state.formState.description,
            location: this.state.formState.location,
            date: this.state.formState.date,
            category: this.state.formState.category
        };

        this.setState({
            isFetching: true
        });

        let locationId = payload.location.id;
        //get lat and long for a specific address
        fetch(
            `${HereConfig.BASE_URL_GEOCODE}?app_id=${HereConfig.APP_ID}&app_code=${
                HereConfig.APP_CODE
            }&locationid=${locationId}&gen=8`,
            {
                method: "JSONP",
                callback: "jsoncallback",
                callbackName: "callbackFiiPractic"
            }
        )
        .then(resp => {
            return resp.json();
        }, err => err)
        .then(resp => {
            const {
            Latitude
            } = resp.Response.View[0].Result[0].Location.DisplayPosition;
            const {
            Longitude
            } = resp.Response.View[0].Result[0].Location.DisplayPosition;
            const newEvent = {
            ...payload,
            location: {
                ...payload.location,
                latitude: Latitude,
                longitude: Longitude
            }
            };

            this.setNewEvent(newEvent, payload.userId).then(() => {
                this.setState({
                    isFetching: false
                });
                this.onClickBackToEventList();
                //TODO call display function to show the new event on the map
            });
        });
    };

    gotAddressResults = (addressObj) => {
        //build the address from the provided address object and set it to the input value state
        const a = addressObj.address;

        //TODO build the address from the provided object

        //TODO call handleLocationInput which will generate the dropdown results based on the input

        //set the new value
        this.setState({
            suggestionForLocation: "",
        });
    };

    handleUpdateFormState = (ev, data) => {
        // data.name, data.value
        this.setState({
            formState: {
                ...this.state.formState,
                [data.name]: data.result
              }
        });
    };

    handleCategoryChange = (ev, data) => {
        this.setState({
            formState: {
                ...this.state.formState,
                [data.name]: data.value
              }
        });
    };

    handleLocationInput = (ev, data) => {
        this.setState({ 
            suggestionForLocation: data.value }, () => {
            if (data.value !== "") {
                this.setState({
                    isFetchingSearch: true
                });

                fetch(
                    `${HereConfig.BASE_URL_AUTOCOMPLETE}?app_id=${
                      HereConfig.APP_ID
                    }&app_code=${HereConfig.APP_CODE}&query=${data.value}&maxresults=10`)
                    .then(resp => {
                      return resp.json();
                    }, err => err)
                    .then(resp => {
                        const locOptions = resp.suggestions.map(item => {
                            return {
                              id: item.locationId,
                              title: item.label
                            };
                          });
                          this.setState({
                            locationOptions: locOptions
                          });

                    });
            }
        });
    };

    checkIfCanSave = () => {
        const {
            title,
            organizer,
            description,
            location,
            date,
            category
        } = this.state.formState;
        return (
            title !== "" &&
            organizer !== "" &&
            description !== "" &&
            location.title !== "" &&
            date !== "" &&
            category !== ""
        );
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
                    <Transition
                        visible={this.state.eventListVisible}
                        animation="fade right"
                        duration={200}
                        onComplete={
                            this.state.eventListVisible
                                ? null
                                : this.onCompleteCreateEvent
                        }
                    >
                        <div className="home__container-dashboard">
                            {!this.state.isFetching
                                ? this.state.eventList.map((item, index) => (
                                      <EventItem
                                          key={index}
                                          index={index}
                                          event={item}
                                          userId={localStorage.getItem(
                                              "userId"
                                          )}
                                          scheduledEvents={this.state.scheduledEvents}
                                          className={
                                              this.state.activeIndex === index
                                                  ? "active"
                                                  : ""
                                          }
                                          onClickEvent={() =>
                                              this.onClickEvent(item, index)
                                          }
                                          onClickJoin={ev =>
                                              this.onClickJoin(ev, item)
                                          }
                                      />
                                  ))
                                : ""}
                        </div>
                    </Transition>
                    <Transition
                        visible={this.state.createEventVisible}
                        animation="fade left"
                        duration={500}
                        onComplete={
                            this.state.createEventVisible
                                ? null
                                : this.onCompleteBackToEventList
                        }
                    >
                        <div className="home__container-dashboard">
                            <div className="location-label">
                                <p>Select A layer:</p>
                            </div>
                            {/* Loop through the layers with map and build the buttons */}
                                <div>
                                        {this.state.layersTiles.map((layer, index) => (
                                            // Put a name and a click event on button
                                            <Button key={index} onClick={() => this.onclickChangeLayer(layer)}>{layer.name}</Button>
                                        ))}
                                </div>
                                    {/*Create a input component from the semantic-ui*/}
                                <Divider hidden />
                            {/* End */}
                            <div className="location-label">
                                <Icon name="asterisk" color="red" size="tiny" />
                                <p>Add a location:</p>
                            </div>
                            <Search
                                fluid
                                name="location"
                                placeholder="Search ..."
                                loading={this.state.isFetchingSearch}
                                onResultSelect={(ev, data) =>
                                    this.handleUpdateFormState(ev, data)
                                }
                                onSearchChange={(ev, data) =>
                                    this.handleLocationInput(ev, data)
                                }
                                results={this.state.locationOptions}
                                value={this.state.suggestionForLocation}
                                className="location-field"
                            />

                            {this.state.formState.location.title !== "" ? (
                                <div className="selected-location">
                                    <div className="ui image label large">
                                        <Icon
                                            name="map marker alternate"
                                            color="orange"
                                        />
                                        {this.state.formState.location.title}
                                        <i
                                            className="delete icon"
                                            onClick={
                                                this.removeSelectedLocation
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}
                            <div className="event_info">
                                <div className="event_info-title">
                                    <div className="event-name-label">
                                        <Icon
                                            name="asterisk"
                                            color="red"
                                            size="tiny"
                                        />
                                        <p>Event name:</p>
                                    </div>
                                    <div className="ui input">
                                        <input
                                            type="text"
                                            name="title"
                                            value={this.state.formState.title}
                                            placeholder="E.g. Party of the Year"
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="event_info-organizer">
                                    <div className="event-organizer-label">
                                        <Icon
                                            name="asterisk"
                                            color="red"
                                            size="tiny"
                                        />
                                        <p>Organised by:</p>
                                    </div>
                                    <div className="ui input">
                                        <input
                                            type="text"
                                            name="organizer"
                                            value={this.state.formState.organizer}
                                            placeholder="E.g. The Event Organiser"
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="event_date">
                                <div className="date-label">
                                    <Icon
                                        name="asterisk"
                                        color="red"
                                        size="tiny"
                                    />
                                    <p>Starts at:</p>
                                </div>
                                <DatetimePickerTrigger
                                    shortcuts={this.shortcuts}
                                    moment={this.state.moment}
                                    closeOnSelectDay={true}
                                    onChange={this.state.handleDateChange}
                                >
                                    <div className="ui action input">
                                        <input
                                            type="text"
                                            name="date"
                                            value={this.state.moment.format(
                                                "lll"
                                            )}
                                            readOnly
                                        />
                                        <button className="ui icon button">
                                            <i className="search icon" />
                                        </button>
                                    </div>
                                </DatetimePickerTrigger>
                            </div>
                            <div className="description-label">
                                <Icon name="asterisk" color="red" size="tiny" />
                                <p>Description:</p>
                            </div>
                            <div className="ui form">
                                <div className="field">
                                    <textarea
                                        rows="3"
                                        name="description"
                                        value={this.state.formState.description}
                                        onChange={this.handleInputChange}
                                        className="description-field"
                                    />
                                </div>
                            </div>
                            <div className="category-label">
                                <Icon name="asterisk" color="red" size="tiny" />
                                <p>Category:</p>
                            </div>

                            <Select
                                name="category"
                                className="category-select"
                                placeholder="Choose a category for your event"
                                options={this.state.categoryOptions}
                                onChange={(ev, data) =>
                                    this.handleCategoryChange(ev, data)
                                }
                            />

                            <div className="event-actions">
                                <div className="ui buttons">
                                    <button
                                        className="ui button"
                                        onClick={this.onClickBackToEventList}
                                    >
                                        Cancel
                                    </button>
                                    <div className="or" />
                                    <button
                                        className={`ui positive button ${
                                            this.checkIfCanSave()
                                                ? ""
                                                : "disabled"
                                        }`}
                                        onClick={this.handleSaveEvent}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        );
    }
}
