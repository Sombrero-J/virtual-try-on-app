const filterState = $state<{ category: string }>({ category: 'All' });

export const filterStore = () => {
	return {
		set filterCategory(x: string) {
			filterState.category = x;
		},

		get filterCategory(): string {
			return filterState.category;
		}
	};
};


export const tops = [
	'T-Shirts',
	'Long-Sleeve Tops',
	'Shirts',
	'Sweaters',
	'Hoodies',
	'Sleeveless'
];

export const bottoms = [
	'Jeans',
	'Pants',
	'Skirts',
	'Shorts',
	'Athletic Bottoms'
];

export const outerwear = [
	'Coats',
	'Jackets',
	'Blazers'
];

export const fullBody = [
	'Dresses',
	'Jumpsuits'
];

export const shoes = [
	'Sneakers',
	'Boots',
	'Sandals',
	'Heels',
	'Flats',
	'Formal Shoes'
];

export const accessories = [
	'Bags',
	'Scarves',
	'Hats',
	'Belts',
	'Jewellery',
	'Sunglasses',
	'Watches',
	'Ties'
];

export const otherEssentials = [
	'Socks',
	'Swimwear',
	'Loungewear'
];

export const allCategories = [
	...tops,
	...bottoms,
	...outerwear,
	...fullBody,
	...shoes,
	...accessories,
	...otherEssentials
];

export const fashionColors = [
	'Black',
	'White',
	'Ivory / Cream',
	'Grey',
	'Charcoal',
	'Beige / Tan',
	'Brown',
	'Navy',
	'Red',
	'Burgundy / Wine',
	'Pink',
	'Hot Pink / Fuchsia',
	'Purple / Violet',
	'Lavender / Lilac',
	'Blue',
	'Light Blue / Sky Blue',
	'Teal / Turquoise',
	'Green',
	'Olive / Khaki',
	'Mint / Sage',
	'Yellow',
	'Mustard',
	'Orange',
	'Rust / Terracotta',
	'Coral / Peach',
	'Gold',
	'Silver',
	'Bronze / Rose Gold'
];
