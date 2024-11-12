import React from 'react';
import renderer from 'react-test-renderer';

import App from '../App.js';

describe('<App />', () => {
    it('App is rendered correctly', () => {
        const tree = renderer.create(<App />).toJSON();
        console.log(tree);
        console.log(typeof (tree));
        console.log(tree.children);
        expect(tree).toBeTruthy();
    });
    it('Home buttons are rendered correctly', () => {
        const tree = renderer.create('<App />').toJSON();
        expect(tree).toBeTruthy();
    })
});
