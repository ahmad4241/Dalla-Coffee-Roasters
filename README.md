# Dalla Coffee Roasters

Website for **Dalla Coffee Roasters**: a scroll-animated hero in four stages (beans fill the hopper, fresh grounds fill a dosing cup under the grinder, a double shot pours while the pressure gauges and the machine's screen follow it, and it all rewinds when you scroll back up), plus a coffee shop, menu, Roast Club subscription, story and visit pages.

**Live site:** https://dalla-coffee-roasters.netlify.app (hosted on Netlify from this repo)

Preview on Claude (v26): https://claude.ai/artifact/766hzJCTeosYU8U7r6QZpo

## Folders

| Folder | What's inside |
| --- | --- |
| `01-Code/` | `index.html` (pages), `style.css` (design and responsive rules), `hero.js` (the scroll animation), `site.js` (shop, menu, cart, pages, forms) |
| `01-Code/images/` | the 21 images the site loads (machine layers, beans, dosing cup, bags, drinks) |
| `02-Images/` | the original Gemini images, full size (machine photos, drinks, bags, empty scene) |
| `03-Versions/` | full zip of each release |

The same structure is mirrored in Google Drive under **Dalla Coffee Roasters** (01 Code, 02 Images, 03 Versions).

## Run it

Open `01-Code/index.html` in a browser. Keep the `images` folder next to it.

## Versions

- **v13** hero animation (machine, beans, pour, rewind)
- **v14** full site around the hero
- **v15** rebrand to Dalla Coffee Roasters: coffee shop, menu, Roast Club, English only, prices in IQD
- **v16** one visual world (warm hero matching the product photos) and a more cinematic hero camera
- **v17** phone fixes: no fade over the machine, bigger machine, closer pour shot
- **v18** sharp beans in the hopper, a real bean pour (beans land and stay on the pile) and a true reverse when scrolling up
- **v19** order on WhatsApp: the cart sends the order (items, grind, delivery or pickup, name, address) to the shop's WhatsApp
- **v20** link preview: share image, title, description and site icon for WhatsApp, Instagram and browsers
- **v26** grind stage: a dosing cup is set under the grinder, fills with fresh grounds and is carried away; four scroll stages; faster pour (the timer still reads 27 s); live pressure gauges; about 16 s from load to a full cup; softer window light (v21 to v25 were previews only)
