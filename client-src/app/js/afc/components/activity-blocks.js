import React from 'react';
import ActivityBlock from './activity-block';
import { ICON_PREFIX } from '../../settings';

const ActivityBlocks = React.createClass({
  displayName: 'ActivityBlocks',
  propTypes: {
    activities: React.PropTypes.object
  },
  render () {
    return !this.props.activities ? <p>loading...</p> : (
        <div>
          <div className="grid-block">
            <ActivityBlock
                activityType="Daily Story"
                activityName={this.props.activities.dailyStory}/>
            <ActivityBlock
                activityType="Daily Crucible"
                activityName={this.props.activities.dailyCrucible}/>
            <ActivityBlock
                activityType="Weekly Crucible"
                activityName={this.props.activities.weeklyCrucible}/>
          </div>
          <div className="grid-block"
               style={{
               width: '874px',
               height: '349px',
               background: `url("${ICON_PREFIX}${this.props.activities.nightfall.image}")`
               }}>
            <ActivityBlock
                activityType="Nightfall"
                activityName={this.props.activities.nightfall.name}
                skulls={this.props.activities.nightfall.skulls}/>
          </div>
        </div>
    );
  }
});

export default ActivityBlocks;
