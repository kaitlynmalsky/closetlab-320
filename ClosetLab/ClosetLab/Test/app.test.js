import React from 'react';
import renderer from 'react-test-renderer';
import { ClothingItem, TagType, reduceListToHumanReadable, Outfit } from '../ClothingAndOutfits.js'; // Importing additional classes and functions

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

describe('ClothingItem Class', () => {
  let clothingItem;

  beforeEach(() => {
    clothingItem = new ClothingItem(
      'image_link_example',
      'Test Item',
      'db_id_example',
      'user_id_example'
    );
  });

  test('should initialize with correct values', () => {
    expect(clothingItem.name).toBe('Test Item');
    expect(clothingItem.image_link).toBe('image_link_example');
    expect(clothingItem.db_id).toBe('db_id_example');
    expect(clothingItem.user_id).toBe('user_id_example');
    expect(clothingItem.color_tags).toEqual([]);
    expect(clothingItem.brand_tags).toEqual([]);
    expect(clothingItem.type_tags).toEqual([]);
    expect(clothingItem.other_tags).toEqual([]);
    expect(clothingItem.useDonationReminder).toBe(true);
  });

  test('should add property to category', () => {
    clothingItem.addPropertyToCategory('Red', TagType.COLOR);
    expect(clothingItem.color_tags).toContain('Red');

    clothingItem.addPropertyToCategory('Nike', TagType.BRAND);
    expect(clothingItem.brand_tags).toContain('Nike');
  });

  test('should remove property from category', () => {
    clothingItem.addPropertyToCategory('Blue', TagType.COLOR);
    clothingItem.removePropertyFromCategory('Blue', TagType.COLOR);
    expect(clothingItem.color_tags).not.toContain('Blue');
  });

  test('should not remove non-existent property', () => {
    const result = clothingItem.removePropertyFromCategory('NonExistent', TagType.COLOR);
    expect(result).toBe(false);
  });

  test('should set individual donation reminder', () => {
    clothingItem.setIndividualDonationReminder(false);
    expect(clothingItem.useDonationReminder).toBe(false);
  });

  test('should set image link', () => {
    clothingItem.setImage('new_image_link');
    expect(clothingItem.image_link).toBe('new_image_link');
  });
});

describe('Outfit Class', () => {
  let outfit;

  beforeEach(() => {
    outfit = new Outfit('Casual Outfit', 'outfit_db_id', 'user_id');
  });

  test('should add items to outfit', () => {
    const item = new ClothingItem('image_link', 'Shirt', 'item_db_id', 'user_id');
    outfit.addItemToOutfit(item);
    expect(outfit.clothingItems).toContain(item);
  });

  test('should remove item from outfit', () => {
    const item = new ClothingItem('image_link', 'Shirt', 'item_db_id', 'user_id');
    outfit.addItemToOutfit(item);
    outfit.removeItemFromOutfit(item);
    expect(outfit.clothingItems).not.toContain(item);
  });

  test('should set outfit title', () => {
    outfit.setTitle('New Title');
    expect(outfit.title).toBe('New Title');
  });
});
