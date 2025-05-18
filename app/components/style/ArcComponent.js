import React from 'react';

const ArcComponent = ({ borderThickness = 30, angle = 180, color = '#c0d860' }) => {
    const arcStyles = {
        '--b': `${borderThickness}px`,
        '--a': `${angle}deg`,
        backgroundColor: color,
    };

    return <div className="arc" style={arcStyles}></div>;
};

export default ArcComponent;