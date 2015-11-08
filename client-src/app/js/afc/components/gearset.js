import React from 'react';

import GearTiles from './gear-tiles';

const Gearset = React.createClass({
  getDefaultProps () {
    return {
      owner: "",
      helmet: [],
      chest: [],
      arms: [],
      boots: [],
      classItem: [],
      artifact: [],
      primaryWeapon: [],
      specialWeapon: [],
      heavyWeapon: [],
      ghost: []
    };
  },
  render () {
    return (
        <div className="gearset">
          <h1>Gearset: {this.props.owner}</h1>
          <dl>
            <dt><h2>Helm</h2></dt>
            <dd><GearTiles items={this.props.helmet}/></dd>
            <dt><h2>Chest</h2></dt>
            <dd><GearTiles items={this.props.chest}/></dd>
            <dt><h2>Arms</h2></dt>
            <dd><GearTiles items={this.props.arms}/></dd>
            <dt><h2>Boots</h2></dt>
            <dd><GearTiles items={this.props.boots}/></dd>
            <dt><h2>Class Item</h2></dt>
            <dd><GearTiles items={this.props.classItem}/></dd>
            <dt><h2>Artifact</h2></dt>
            <dd><GearTiles items={this.props.artifact}/></dd>
            <dt><h2>Primary</h2></dt>
            <dd><GearTiles items={this.props.primaryWeapon}/></dd>
            <dt><h2>Special</h2></dt>
            <dd><GearTiles items={this.props.specialWeapon}/></dd>
            <dt><h2>Heavy</h2></dt>
            <dd><GearTiles items={this.props.heavyWeapon}/></dd>
            <dt><h2>Ghost</h2></dt>
            <dd><GearTiles items={this.props.ghost}/></dd>
          </dl>
        </div>
    );
  }
});

export default Gearset;
