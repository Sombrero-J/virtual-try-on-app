# Diff Details

Date : 2025-04-16 16:39:56

Directory /Users/jayden/Desktop/FYP/virtual-try-on-app/src

Total : 56 files,  1179 codes, -61 comments, 141 blanks, all 1259 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [src/app.css](/src/app.css) | PostCSS | 1 | 0 | 1 | 2 |
| [src/lib/components/buttons/navButton.svelte](/src/lib/components/buttons/navButton.svelte) | Svelte | 0 | 0 | -1 | -1 |
| [src/lib/components/dialog/dialog.svelte](/src/lib/components/dialog/dialog.svelte) | Svelte | 5 | 0 | 0 | 5 |
| [src/lib/components/melt/multiselect.svelte](/src/lib/components/melt/multiselect.svelte) | Svelte | 161 | 2 | 23 | 186 |
| [src/lib/components/melt/select.svelte](/src/lib/components/melt/select.svelte) | Svelte | 19 | 0 | 4 | 23 |
| [src/lib/components/melt/toast.svelte](/src/lib/components/melt/toast.svelte) | Svelte | 1 | 0 | 0 | 1 |
| [src/lib/components/profile/profilepopover.svelte](/src/lib/components/profile/profilepopover.svelte) | Svelte | 96 | 0 | 8 | 104 |
| [src/lib/components/profile/sectionbutton.svelte](/src/lib/components/profile/sectionbutton.svelte) | Svelte | 0 | 0 | -1 | -1 |
| [src/lib/components/textbox.svelte](/src/lib/components/textbox.svelte) | Svelte | -96 | -1 | -5 | -102 |
| [src/lib/components/wardrobe/filterButton.svelte](/src/lib/components/wardrobe/filterButton.svelte) | Svelte | -2 | 0 | 3 | 1 |
| [src/lib/content/vto-qr/qrcode.svelte](/src/lib/content/vto-qr/qrcode.svelte) | Svelte | 6 | 0 | 0 | 6 |
| [src/lib/server/database\_helpers/queryDb.ts](/src/lib/server/database_helpers/queryDb.ts) | TypeScript | 38 | -4 | 1 | 35 |
| [src/lib/server/database\_helpers/storage.ts](/src/lib/server/database_helpers/storage.ts) | TypeScript | -8 | 0 | 0 | -8 |
| [src/lib/server/database\_helpers/uploadClothing.ts](/src/lib/server/database_helpers/uploadClothing.ts) | TypeScript | 0 | -54 | -7 | -61 |
| [src/lib/server/openai/openai.ts](/src/lib/server/openai/openai.ts) | TypeScript | -64 | -7 | -8 | -79 |
| [src/lib/state/appstate.svelte.ts](/src/lib/state/appstate.svelte.ts) | TypeScript | 147 | 0 | 14 | 161 |
| [src/lib/svg/Lines-hiw.svg](/src/lib/svg/Lines-hiw.svg) | XML | -72 | 0 | -1 | -73 |
| [src/lib/svg/Lines.svg](/src/lib/svg/Lines.svg) | XML | -106 | 0 | 0 | -106 |
| [src/lib/svg/login\_background.svg](/src/lib/svg/login_background.svg) | XML | -33 | 0 | -1 | -34 |
| [src/lib/svg/signup\_background.svg](/src/lib/svg/signup_background.svg) | XML | -22 | 0 | -1 | -23 |
| [src/lib/svg/small/download.svelte](/src/lib/svg/small/download.svelte) | Svelte | 14 | 0 | 1 | 15 |
| [src/lib/svg/small/profile/logout.svelte](/src/lib/svg/small/profile/logout.svelte) | Svelte | 9 | 0 | 1 | 10 |
| [src/lib/svg/small/share.svelte](/src/lib/svg/small/share.svelte) | Svelte | 1 | 0 | 1 | 2 |
| [src/lib/svg/small/wardrobe/edit.svelte](/src/lib/svg/small/wardrobe/edit.svelte) | Svelte | 1 | 0 | 0 | 1 |
| [src/lib/svg/tick.svelte](/src/lib/svg/tick.svelte) | Svelte | 5 | 0 | 1 | 6 |
| [src/lib/type/supabase.ts](/src/lib/type/supabase.ts) | TypeScript | 271 | 0 | 1 | 272 |
| [src/routes/(app)/+layout.svelte](/src/routes/(app)/+layout.svelte) | Svelte | 62 | 0 | 4 | 66 |
| [src/routes/(app)/by/+layout.server.ts](/src/routes/(app)/by/+layout.server.ts) | TypeScript | 15 | 0 | 5 | 20 |
| [src/routes/(app)/by/create-custom/+page.server.ts](/src/routes/(app)/by/create-custom/+page.server.ts) | TypeScript | 11 | 0 | 4 | 15 |
| [src/routes/(app)/by/create-custom/+page.svelte](/src/routes/(app)/by/create-custom/+page.svelte) | Svelte | 121 | 1 | 12 | 134 |
| [src/routes/(app)/by/myphotos/+page@by.svelte](/src/routes/(app)/by/myphotos/+page@by.svelte) | Svelte | 92 | 0 | 3 | 95 |
| [src/routes/(app)/home/+page.server.ts](/src/routes/(app)/home/+page.server.ts) | TypeScript | 44 | 2 | 12 | 58 |
| [src/routes/(app)/home/+page.svelte](/src/routes/(app)/home/+page.svelte) | Svelte | 202 | -5 | 14 | 211 |
| [src/routes/(app)/home/helpers.ts](/src/routes/(app)/home/helpers.ts) | TypeScript | 69 | 10 | 12 | 91 |
| [src/routes/(app)/outfits/+page.server.ts](/src/routes/(app)/outfits/+page.server.ts) | TypeScript | -3 | 0 | 0 | -3 |
| [src/routes/(app)/outfits/+page.svelte](/src/routes/(app)/outfits/+page.svelte) | Svelte | 79 | 0 | 10 | 89 |
| [src/routes/(app)/outfits/create-custom/+page.svelte](/src/routes/(app)/outfits/create-custom/+page.svelte) | Svelte | -4 | 0 | -2 | -6 |
| [src/routes/(app)/vto-test/body-image-upload/+page.server.ts](/src/routes/(app)/vto-test/body-image-upload/+page.server.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [src/routes/(app)/vto-test/body-image-upload/+page.svelte](/src/routes/(app)/vto-test/body-image-upload/+page.svelte) | Svelte | 120 | 8 | 14 | 142 |
| [src/routes/(app)/vto-test/clothing-image-upload/+page.server.ts](/src/routes/(app)/vto-test/clothing-image-upload/+page.server.ts) | TypeScript | 4 | 0 | 3 | 7 |
| [src/routes/(app)/vto-test/clothing-image-upload/+page.svelte](/src/routes/(app)/vto-test/clothing-image-upload/+page.svelte) | Svelte | 189 | 33 | 19 | 241 |
| [src/routes/(app)/vto-test/generation/+page.server.ts](/src/routes/(app)/vto-test/generation/+page.server.ts) | TypeScript | 274 | 7 | 49 | 330 |
| [src/routes/(app)/vto-test/generation/+page.svelte](/src/routes/(app)/vto-test/generation/+page.svelte) | Svelte | 147 | 4 | 8 | 159 |
| [src/routes/(app)/vto-test/generation/utils.ts](/src/routes/(app)/vto-test/generation/utils.ts) | TypeScript | 78 | 1 | 12 | 91 |
| [src/routes/(app)/wardrobe/+page.server.ts](/src/routes/(app)/wardrobe/+page.server.ts) | TypeScript | 12 | 0 | 4 | 16 |
| [src/routes/(app)/wardrobe/+page.svelte](/src/routes/(app)/wardrobe/+page.svelte) | Svelte | 20 | 0 | 2 | 22 |
| [src/routes/(vto)/beta/melt/+page.server.ts](/src/routes/(vto)/beta/melt/+page.server.ts) | TypeScript | 99 | 19 | 24 | 142 |
| [src/routes/(vto)/beta/melt/+page.svelte](/src/routes/(vto)/beta/melt/+page.svelte) | Svelte | -14 | -25 | -2 | -41 |
| [src/routes/(vto)/beta/vto-test/body-image-upload/+page.server.ts](/src/routes/(vto)/beta/vto-test/body-image-upload/+page.server.ts) | TypeScript | -12 | 0 | -3 | -15 |
| [src/routes/(vto)/beta/vto-test/body-image-upload/+page.svelte](/src/routes/(vto)/beta/vto-test/body-image-upload/+page.svelte) | Svelte | -130 | -8 | -13 | -151 |
| [src/routes/(vto)/beta/vto-test/clothing-image-upload/+page.server.ts](/src/routes/(vto)/beta/vto-test/clothing-image-upload/+page.server.ts) | TypeScript | -4 | 0 | -3 | -7 |
| [src/routes/(vto)/beta/vto-test/clothing-image-upload/+page.svelte](/src/routes/(vto)/beta/vto-test/clothing-image-upload/+page.svelte) | Svelte | -175 | -33 | -18 | -226 |
| [src/routes/(vto)/beta/vto-test/generation/+page.server.ts](/src/routes/(vto)/beta/vto-test/generation/+page.server.ts) | TypeScript | -267 | -6 | -44 | -317 |
| [src/routes/(vto)/beta/vto-test/generation/+page.svelte](/src/routes/(vto)/beta/vto-test/generation/+page.svelte) | Svelte | -147 | -4 | -8 | -159 |
| [src/routes/(vto)/beta/vto-test/generation/utils.ts](/src/routes/(vto)/beta/vto-test/generation/utils.ts) | TypeScript | -78 | -1 | -12 | -91 |
| [src/routes/api/submitTask/+server.ts](/src/routes/api/submitTask/+server.ts) | TypeScript | -2 | 0 | -1 | -3 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details