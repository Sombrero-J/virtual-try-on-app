// use IndexedDB to persist data

// I don't use classes here because new objects will be created whenever new ImageStore() is run, defeating the purpose of persisting state across duplicating components

const modelImage = $state<{ file: File | null }>({ file: null });
const clothingImage = $state<{ file: File | null; name: string | null }>({
	file: null,
	name: null
});
const tryonImage = $state<{ url: string | null }>({ url: null });
const task = $state<{ ID: string | null }>({ ID: null });
const category = $state<{ name: string | null }>({ name: null });

export const tryOnStore = () => {
	return {
		set modelImageFile(x: File) {
			modelImage.file = x;
		},

		get modelImageFile(): File | null {
			return modelImage.file;
		},

		set clothingImageFile(x: File) {
			clothingImage.file = x;
		},

		get clothingImageFile(): File | null {
			return clothingImage.file;
		},

		set clothingImageName(x: string) {
			clothingImage.name = x;
		},

		get clothingImageName(): string | null {
			return clothingImage.name;
		},

		set tryonImageUrl(x: string) {
			tryonImage.url = x;
		},

		get tryonImageUrl(): string | null {
			return tryonImage.url;
		},

		set taskID(x: string) {
			task.ID = x;
		},

		get taskID(): string | null {
			return task.ID;
		},

		set category(x: string) {
			category.name = x;
		},

		get category(): string | null {
			return category.name;
		}
	};
};
