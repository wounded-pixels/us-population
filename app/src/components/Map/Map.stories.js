import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { topoToGeo } from '../../DataManipulation';

import Map from './Map';
import Tooltip from '../Tooltip/Tooltip';

const buildTooltip = d => {
  return 'Static tooltip';
};

const calculateFill = d => {
  return 'blue';
};

const topoJSON = require('../../../public/topo-json/us-10m.json');
const statesGeoJSON = topoToGeo(topoJSON, 'states');
const countiesGeoJSON = topoToGeo(topoJSON, 'counties');

storiesOf('Map', module)
  .addDecorator(story =>
    <div>
      <Tooltip />
      <svg width="950" height="500">
        {story()}
      </svg>
    </div>,
  )
  .add('empty', () => {
    return <Map width="950" />;
  })
  .add('populated', () => {
    return (
      <Map
        regionsGeoJSON={statesGeoJSON}
        buildTooltip={buildTooltip}
        calculateFill={calculateFill}
        minScale="0"
        maxScale="1000000"
        scale="1"
      />
    );
  });
