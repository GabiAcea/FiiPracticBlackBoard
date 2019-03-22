import React, { Component } from "react";
import { Button, Header, Icon, Modal } from "semantic-ui-react";

export default class EventItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  closeModal = () => {
    this.setState({
      open: false
    });
  };

  checkIfWasScheduled = () => {
    return this.props.scheduledEvents.indexOf(this.props.event.eventId) !== -1;
  };

  render() {
    const { event } = this.props;
    return (
      <div
        className={`event_item-container ${this.props.className}`}
        onClick={this.props.onClickEvent}
      >
        <div className="event_item-date-container">
          <div className="event_item-date-day">{event.date.day}</div>
          <div className="event_item-date-month">{event.date.month}</div>
        </div>
        <div className="event_item-info-container">
          <div className="event_item-info-title">{event.title}</div>
          <div className="event_item-info-date">
            <i className="clock outline grey icon" />
            {event.date.entireDate}
          </div>
          <div className="event_item-info-location">
            <i className="map marker alternate grey icon" />
            {event.location.title}
          </div>
          <div className="event_item-info-description">
            <div className="event_item-info-description-label">
              <i className="circle orange icon tiny" />
              <span>Description:</span>
            </div>
            {event.description}
          </div>
          <div className="event_item-info-organizer">
            <div className="event_item-info-organizer-label">
              <i className="circle orange icon tiny" />
              <span>Organizer:</span>
            </div>
            {event.organizer}
          </div>
          <div className="event_item-info-category">
            <div className="event_item-info-category-label">
              <i className="circle orange icon tiny" />
              <span>Category:</span>
            </div>
            {event.category}
          </div>
        </div>
        <div className="event_item-action-container">
          {this.props.userId !== event.userId ? (
            !this.checkIfWasScheduled() ? (
              <Modal
                open={this.state.open}
                trigger={
                  <button
                    className="ui  basic orange button"
                    onClick={ev => {
                      ev.stopPropagation();
                      this.setState({ open: true });
                    }}
                  >
                    JOIN
                  </button>
                }
                basic
                size="tiny"
                onClose={this.closeModal}
              >
                <Header
                  icon="calendar alternate"
                  content="Schedule this event"
                />
                <Modal.Content>
                  <p>Hello sir, would you like to join this event?</p>
                </Modal.Content>
                <Modal.Actions>
                  <Button basic color="red" inverted onClick={this.closeModal}>
                    <Icon name="remove" /> No
                  </Button>
                  <Button
                    color="green"
                    inverted
                    onClick={ev => {
                      this.closeModal();
                      this.props.onClickJoin(ev);
                    }}
                  >
                    <Icon name="checkmark" /> Yes
                  </Button>
                </Modal.Actions>
              </Modal>
            ) : (
              <div>
                <i className=" calendar alternate orange icon big" />
              </div>
            )
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}
