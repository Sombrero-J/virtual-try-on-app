import { SvelteSet } from 'svelte/reactivity';

export const deleteState = $state({ isDelete: false });

export const selectedDeleteItems = new SvelteSet<number>();
export const toggleDelete = () => {
	deleteState.isDelete = !deleteState.isDelete;
	if (!deleteState.isDelete) {
		console.log('Delete mode is off');
		selectedDeleteItems.clear();
	}
};
