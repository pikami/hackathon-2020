import { Element, Helpers } from "test-juggler";
import { AStarPathFinder } from './libs/AStarPathFinder';

describe("Helpers", () => {
    beforeEach(async () => {
        console.log("Running test: " + jasmine["currentTest"].fullName);
    });

    it("og for a fee, keep on sipping fam", async () => {
        await page.goto("https://seokky.github.io/vue-snake-game/");

        // Start game
        const startGameBtn = new Element("button.startGameBtn");
        startGameBtn.click();

        const areaField = new Element(".areaField");
        await areaField.waitUntilVisible();

        page.keyboard.press('Space');

        // Get map
        const areaFields = await page.$$(".areaField");

        const map = {};
        const mapForAstar = {};
        let start_coords, end_coords;

        (await Promise.all(
            areaFields.map(async (field) => {
                const idProperty = await field.getProperty('id');
                const idPropertyValue = await idProperty.jsonValue();
                const classListProperty = await field.getProperty('classList');
                const classList = await classListProperty.jsonValue();
                const coords = idPropertyValue.split(':');
                return { x: coords[0], y: coords[1], classList: Object.values(classList) };
            })))
        .forEach((cell) => {
            const { x, y, classList } = cell;
            if(!map[x]) map[x] = [];
            
            map[x][y] =
                classList.includes("meatField") ? '1' :
                classList.includes("snakeHead") ? '2' :
                classList.includes('snakePart') ? '3' : '0';

            if(!mapForAstar[x]) mapForAstar[x] = {}
            mapForAstar[x][y] =
                !classList.includes('snakePart');

            if (classList.includes('meatField'))
                end_coords = [ x, y ];

            if (classList.includes('snakeHead'))
                start_coords = [ x, y ];
        });

        const astar = new AStarPathFinder(map[0].length, map.length);
        astar.loadMap(mapForAstar);
        astar.setStart(start_coords[0], start_coords[1]);
        astar.setDestination(end_coords[0], end_coords[1]);
        const path = astar.findPath();

        // wait
        const elementToLoad = new Element("div.areaField#jksnvsdn");
        await elementToLoad.waitUntilVisible();
    });
});