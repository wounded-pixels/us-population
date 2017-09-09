// @flow

import React, { Component } from 'react';
import * as d3 from 'd3';

import Map from './components/Map/Map';
import Tooltip from './components/Tooltip/Tooltip';
import { topoToGeo, enrich } from './DataManipulation';

import './App.css';

class App extends Component {
  state: {
    countiesGeoJSON: Object,
    statesGeoJSON: Object,
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      countiesGeoJSON: Object,
      statesGeoJSON: Object,
    };
  }

  componentDidMount() {
    d3
      .queue()
      .defer(d3.json, '/topo-json/us-10m.json')
      .defer(d3.csv, '/data/StatesFIPSCodes.csv')
      .defer(d3.csv, '/data/ACS_15_SPT_B01003.csv')
      .await((error, topoJSON, stateFipsCodes, populationByCounty) => {
        const statesGeoJSON = topoToGeo(topoJSON, 'states');
        const countiesGeoJSON = topoToGeo(topoJSON, 'counties');

        const populationByState = populationByCounty.reduce(
          (popMap, county) => {
            const stateFIPS = county['GEO.id2'].substring(0, 2);
            popMap[stateFIPS] = popMap[stateFIPS] || 0;
            popMap[stateFIPS] += +county['HD01_VD01'];
            return popMap;
          },
          {},
        );

        statesGeoJSON.forEach(feature => {
          feature.properties.population = populationByState[feature.id];
        });

        enrich(statesGeoJSON, stateFipsCodes, 'STATE_FIPS', {
          STATE_NAME: 'name',
          STATE_FIPS: 'fipsCode',
          STUSAB: 'abbreviation',
        });

        enrich(countiesGeoJSON, populationByCounty, 'GEO.id2', {
          'GEO.display-label': 'name',
          'GEO.id2': 'fipsCode',
          HD01_VD01: 'population',
        });

        this.setState({ statesGeoJSON });
        this.setState({ countiesGeoJSON });
      });
  }

  render() {
    return (
      <div id="App">
        <Tooltip />
        <Map
          width="950"
          statesGeoJSON={this.state.statesGeoJSON}
          countiesGeoJSON={this.state.countiesGeoJSON}
        />
      </div>
    );
  }
}

export default App;
