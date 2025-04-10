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

export const tops = ['T-Shirts', 'Long-Sleeve Tops', 'Shirts', 'Sweaters', 'Hoodies', 'Sleeveless'];

export const bottoms = ['Jeans', 'Pants', 'Skirts', 'Shorts', 'Athletic Bottoms'];

export const outerwear = ['Coats', 'Jackets', 'Blazers'];

export const fullBody = ['Dresses', 'Jumpsuits'];

export const shoes = ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Formal Shoes'];

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

export const otherEssentials = ['Socks', 'Swimwear', 'Loungewear'];

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

export type ColorOption = {
	name: string;
	hex: string;
};

export const fashionColorsWithHex: ColorOption[] = [
	{ name: 'Black', hex: '#000000' }, // Add approximate hex codes
	{ name: 'White', hex: '#FFFFFF' },
	{ name: 'Ivory / Cream', hex: '#FFFDD0' }, // Example hex
	{ name: 'Grey', hex: '#808080' },
	{ name: 'Charcoal', hex: '#36454F' },
	{ name: 'Beige / Tan', hex: '#D2B48C' }, // Tan hex
	{ name: 'Brown', hex: '#964B00' },
	{ name: 'Navy', hex: '#000080' },
	{ name: 'Red', hex: '#FF0000' },
	{ name: 'Burgundy / Wine', hex: '#800020' },
	{ name: 'Pink', hex: '#FFC0CB' },
	{ name: 'Hot Pink / Fuchsia', hex: '#FF00FF' }, // Fuchsia hex
	{ name: 'Purple / Violet', hex: '#800080' },
	{ name: 'Lavender / Lilac', hex: '#E6E6FA' }, // Lavender hex
	{ name: 'Blue', hex: '#0000FF' },
	{ name: 'Light Blue / Sky Blue', hex: '#ADD8E6' },
	{ name: 'Teal / Turquoise', hex: '#40E0D0' }, // Turquoise hex
	{ name: 'Green', hex: '#008000' },
	{ name: 'Olive / Khaki', hex: '#808000' }, // Olive hex
	{ name: 'Mint / Sage', hex: '#98FB98' }, // PaleGreen/Mint hex
	{ name: 'Yellow', hex: '#FFFF00' },
	{ name: 'Mustard', hex: '#FFDB58' },
	{ name: 'Orange', hex: '#FFA500' },
	{ name: 'Rust / Terracotta', hex: '#B7410E' }, // Rust hex
	{ name: 'Coral / Peach', hex: '#FF7F50' }, // Coral hex
	{ name: 'Gold', hex: '#FFD700' },
	{ name: 'Silver', hex: '#C0C0C0' },
	{ name: 'Bronze / Rose Gold', hex: '#CD7F32' }
];

export const materials = [
	'Acetate',
	'Acrylic',
	'Alpaca',
	'Bamboo Viscose', // Often marketed simply as 'Bamboo'
	'Cashmere',
	'Chiffon', // A type of fabric (weave), but commonly listed
	'Corduroy', // A type of fabric (texture), but commonly listed
	'Cotton',
	'Cupro',
	'Denim', // A type of fabric (weave), but commonly listed
	'Down', // Insulation, important for outerwear
	'Elastane', // Often used interchangeably with Spandex/Lycra
	'Faux Fur',
	'Faux Leather', // Also known as PU Leather, Pleather, Vegan Leather
	'Flannel', // A type of fabric (finish/weave), but commonly listed
	'Fleece', // Often Polyester, but a distinct category for users
	'Hemp',
	'Jersey', // A type of knit fabric, but commonly listed
	'Jute', // More common in accessories/shoes, but sometimes clothing
	'Lace', // A type of fabric (construction)
	'Leather',
	'Linen',
	'Lyocell', // Often branded as Tencel
	'Mesh',
	'Microfiber', // Often Polyester/Nylon, but a distinct category
	'Modal',
	'Mohair',
	'Neoprene',
	'Nylon', // Also known as Polyamide
	'Organic Cotton', // Important distinction for many users
	'Polyester',
	'Polyurethane', // Often used for coatings or faux leather
	'Ramie',
	'Rayon', // Often used interchangeably with Viscose
	'Satin', // A type of weave, but commonly listed
	'Sequin', // A decoration, but often the defining material feature
	'Silk',
	'Spandex', // Often used interchangeably with Elastane/Lycra
	'Suede', // A type of leather finish
	'Tencel', // Brand name for Lyocell, very common
	'Terry Cloth', // Toweling fabric, common for robes/loungewear
	'Tweed', // A type of fabric (weave/texture), but commonly listed
	'Velvet', // A type of fabric (pile), but commonly listed
	'Viscose', // Often used interchangeably with Rayon
	'Wool'
];